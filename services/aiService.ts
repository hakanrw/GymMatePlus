import { collection, query, where, getDocs, addDoc, doc, setDoc } from '@firebase/firestore';
import { firestore } from '../app/firebaseConfig';
import { getAuth } from 'firebase/auth';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface AIResponse {
    success: boolean;
    response?: string;
    error?: string;
    note?: string;
}

class AIService {
    private baseUrl = __DEV__ ? 'http://192.168.1.80:8000' : 'http://vps-8e6957ba.vps.ovh.net:8000'; // Android emulator uses 10.0.2.2
    private conversationHistory: Message[] = [];
    private retryCount = 0;
    private maxRetries = 2;

    async generateResponse(userMessage: string, messageHistory?: Message[]): Promise<string> {
        try {
            // Update conversation history
            if (messageHistory) {
                this.conversationHistory = messageHistory;
            }

            console.log('[DEBUG] 🔄 Attempting to connect to AI server:', this.baseUrl);
            
            // Try to call the real AI server
            const response = await this.callAIServer(userMessage);
            this.retryCount = 0; // Reset retry count on success
            
            console.log('[DEBUG] ✅ AI server responded successfully');
            return response;

        } catch (error) {
            console.error('[DEBUG] ❌ AI Service Error:', error);
            console.error('[DEBUG] 📍 Server URL:', this.baseUrl);
            console.error('[DEBUG] 📄 Error details:', JSON.stringify(error, null, 2));
            
            // If server is not available, use fallback responses
            return this.getFallbackResponse(userMessage);
        }
    }

    private async callAIServer(userMessage: string): Promise<string> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
            console.log('[DEBUG] 📡 Making HTTP request to:', `${this.baseUrl}/chat`);
            console.log('[DEBUG] 📝 Request payload:', {
                message: userMessage,
                user_id: getAuth().currentUser?.uid || 'anonymous',
                conversation_length: this.conversationHistory.length
            });

            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversation_history: this.conversationHistory.slice(-6), // Last 6 messages for context
                    user_id: getAuth().currentUser?.uid || '',
                    timestamp: new Date().toISOString()
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            console.log('[DEBUG] 📊 Response status:', response.status);
            console.log('[DEBUG] 📋 Response headers:', JSON.stringify([...response.headers.entries()]));

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: AIResponse = await response.json();
            console.log('[DEBUG] 📦 Response data:', data);

            if (data.success && data.response) {
                // Check if a program was created
                if ((data as any).program_created) {
                    console.log('Program created by AI:', (data as any).program);
                    
                    // Save the program to Firebase
                    await this.saveProgramToFirebase((data as any).program, (data as any).user_info);
                }
                
                return data.response;
            } else {
                throw new Error(data.error || 'AI response failed');
            }

        } catch (error: any) {
            clearTimeout(timeoutId);
            
            console.error('[DEBUG] 🚨 HTTP Request failed:', error);
            
            if (error.name === 'AbortError') {
                throw new Error('AI server response timeout');
            }
            
            // Check if it's a network error
            if (error.message.includes('Network request failed') || 
                error.message.includes('fetch')) {
                throw new Error('AI server is not available');
            }
            
            throw error;
        }
    }

    private async saveProgramToFirebase(program: any, userInfo: any): Promise<void> {
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            
            if (!currentUser || !currentUser.uid) {
                console.error('No authenticated user found');
                return;
            }

            // Save to user's programs collection
            const programData = {
                name: `AI Programı - ${userInfo.goal}`,
                description: `${userInfo.workout_days} gün/hafta ${userInfo.goal} programı`,
                difficulty: userInfo.experience || 'Başlangıç',
                estimatedDuration: '45-60 dakika',
                equipment: 'Gym Equipment',
                goal: userInfo.goal,
                workoutDays: userInfo.workout_days,
                program: program,
                createdBy: 'AI',
                createdAt: new Date(),
                userId: currentUser.uid,
                isActive: true
            };

            // Save to Firebase
            const userDoc = doc(firestore, 'users', currentUser.uid);
            await setDoc(userDoc, { 
                program,
            }, { merge: true });
            
            console.log('[DEBUG] ✅ Program başarıyla kaydedildi!');
                        
        } catch (error) {
            console.error('Error saving program to Firebase:', error);
        }
    }

    private getFallbackResponse(userMessage: string): string {
        const message = userMessage.toLowerCase();
        
        // Program creation requests
        if (message.includes('program') || message.includes('antrenman')) {
            return `💪 **Antrenman Programı**

Program oluşturmak için şu bilgileri paylaşabilir misiniz:
• Cinsiyetiniz (Erkek/Kadın)  
• Deneyim seviyeniz (Başlangıç/Orta/İleri)
• Hedefiniz (Kas kazanımı/Yağ yakımı)
• Haftada kaç gün antrenman yapmak istiyorsunuz?

Bu bilgilerle size özel bir program hazırlayabilirim!

🤖 **AI Sunucu Durumu:** Şu anda Gemini AI'ya bağlanamıyorum. Daha gelişmiş AI yanıtlar için:
1. \`ai\` klasöründeki \`ai_server.py\`'yi çalıştırın
2. Terminal: \`cd ai && python ai_server.py\`
3. Server: http://localhost:5000 adresinde çalışmalı`;
        }
        
        // Exercise technique questions
        if (message.includes('bench press') || message.includes('göğüs')) {
            return this.getExerciseInfo('Bench Press') + '\n\n🤖 **Not:** Gemini AI aktif olsaydı daha detaylı analiz verebilirdim.';
        }
        
        if (message.includes('squat') || message.includes('çömelme')) {
            return this.getExerciseInfo('Squat') + '\n\n🤖 **Not:** Gemini AI aktif olsaydı daha detaylı analiz verebilirdim.';
        }
        
        if (message.includes('deadlift') || message.includes('ölü kaldırış')) {
            return this.getExerciseInfo('Deadlift') + '\n\n🤖 **Not:** Gemini AI aktif olsaydı daha detaylı analiz verebilirdim.';
        }
        
        // Nutrition questions
        if (message.includes('beslenme') || message.includes('diyet') || message.includes('protein')) {
            return `🥗 **Beslenme Rehberi**

**Temel Prensipler:**
• Protein: Vücut ağırlığınızın kg başına 1.6-2.2g
• Su: Günde en az 2.5-3 litre
• Öğün sayısı: 3-5 öğün düzenli saatlerde

**Kaliteli Protein Kaynakları:**
• Tavuk göğsü, hindi
• Balık (somon, ton balığı)
• Yumurta
• Peynir, süt ürünleri
• Baklagiller

**Kas Kazanımı için:**
• Kalori fazlası (günlük ihtiyaç + 300-500 kalori)
• Antrenman öncesi karbonhidrat
• Antrenman sonrası protein + karbonhidrat

**Yağ Yakımı için:**
• Kalori açığı (günlük ihtiyaç - 300-500 kalori)
• Protein oranını artırın
• Lifli gıdalara odaklanın

🤖 **Gemini AI:** Aktif olsaydı size kişiselleştirilmiş beslenme planı oluşturabilirdim.`;
        }
        
        // Recovery questions
        if (message.includes('dinlenme') || message.includes('uyku') || message.includes('toparlanma')) {
            return `😴 **Toparlanma ve Dinlenme**

**Uyku:**
• Günde 7-9 saat kaliteli uyku
• Düzenli uyku saatleri
• Yatak odası serin ve karanlık

**Dinlenme Günleri:**
• Haftada en az 1-2 tam dinlenme günü
• Aktif dinlenme: hafif yürüyüş, germe
• Aynı kas grubunu ardışık günlerde çalıştırmayın

**Stres Yönetimi:**
• Meditasyon veya nefes egzersizleri
• Sosyal aktiviteler
• Hobi edinme

🤖 **Gemini AI:** Aktif olsaydı uyku kalitenizi analiz edip kişisel öneriler verebilirdim.`;
        }
        
        // Default response
        return `🤖 **GymMate+ AI Antrenör** (Offline Mode)

Merhaba! Şu anda **temel yanıt modunda** çalışıyorum. Size yardımcı olabileceğim konular:

💪 **Antrenman Programları** (temel)
🥗 **Beslenme Rehberi** (genel)
😴 **Toparlanma Tavsiyeleri** (standart)
🏋️‍♀️ **Egzersiz Teknikleri** (sınırlı)

---

🚀 **Tam AI Deneyimi için:**
1. Terminal açın: \`cd ai\`
2. Komutu çalıştırın: \`python ai_server.py\`
3. Server başladığında Gemini AI aktif olacak!

**Gemini AI Avantajları:**
✨ Kişiselleştirilmiş yanıtlar
🧠 Konuşma geçmişini hatırlar  
📊 Gelişmiş analiz ve öneriler
🎯 Hedefinize özel programlar

Hangi konuda yardıma ihtiyacınız var?`;
    }

    private getExerciseInfo(exerciseName: string): string {
        const exercises = {
            'Bench Press': {
                description: 'Göğüs kaslarını geliştiren temel compound egzersiz',
                targetMuscles: ['Pectoralis Major', 'Triceps', 'Anterior Deltoid'],
                equipment: 'Barbell ve Bench',
                instructions: [
                    'Benchte sırt üstü uzanın',
                    'Barı omuz genişliğinde tutun',
                    'Barı göğsünüze doğru kontrollü indirin',
                    'Güçlü bir şekilde yukarı itin',
                    'Nefes kontrolünü unutmayın'
                ]
            },
            'Squat': {
                description: 'Bacak ve kalça kaslarını geliştiren temel egzersiz',
                targetMuscles: ['Quadriceps', 'Hamstrings', 'Glutes'],
                equipment: 'Barbell veya Dumbbell',
                instructions: [
                    'Ayakları omuz genişliğinde açın',
                    'Sırtı düz tutun',
                    'Kalçaları geriye doğru iterkn çömelin',
                    'Dizler ayak parmaklarını geçmesin',
                    'Topukları yere basarak kalkmaya odaklanın'
                ]
            },
            'Deadlift': {
                description: 'Tüm vücudu çalıştıran compound egzersiz',
                targetMuscles: ['Hamstrings', 'Glutes', 'Erector Spinae', 'Traps'],
                equipment: 'Barbell',
                instructions: [
                    'Ayakları kalça genişliğinde açın',
                    'Barı ayakların üzerine getirin',
                    'Sırtı düz tutarak eğilin',
                    'Barı bacaklarınıza yakın tutun',
                    'Kalça ve dizleri aynı anda açarak kalkın'
                ]
            }
        };

        const exercise = exercises[exerciseName as keyof typeof exercises];
        if (!exercise) {
            return "Bu egzersiz hakkında bilgi bulunamadı.";
        }

        return `🏋️‍♀️ **${exerciseName} Tekniği:**

**Açıklama:**
${exercise.description}

**Hedef Kaslar:**
${exercise.targetMuscles.map(muscle => `• ${muscle}`).join('\n')}

**Ekipman:**
• ${exercise.equipment}

**Adımlar:**
${exercise.instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}`;
    }

    // Method to update conversation history
    updateConversationHistory(messages: Message[]) {
        this.conversationHistory = messages;
    }

    // Method to set AI server URL (for configuration)
    setServerUrl(url: string) {
        this.baseUrl = url;
    }
}

const aiService = new AIService();
export default aiService; 
