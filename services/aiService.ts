import programService from './programService';
import { collection, query, where, getDocs } from '@firebase/firestore';
import { firestore } from '../app/firebaseConfig';
import { doc, setDoc } from '@firebase/firestore';
import { getAuth } from 'firebase/auth';

interface UserInfo {
    gender?: string;
    experience?: string;
    goal?: string;
    workout_days?: string;
    focus_area?: string;
}

interface Exercise {
    id: string;
    name: string;
    area: string;
    description: string;
    instructions: string[];
    targetMuscles: string[];
    equipment: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    imageUrl?: string;
}

interface WorkoutDay {
  exercise: string;
  sets: string;
  rpe: string;
}

interface WorkoutProgram {
  [key: string]: WorkoutDay[];
}

class AIService {
    private userInfo: UserInfo = {};

    async generateResponse(userMessage: string): Promise<string> {
        const message = userMessage.toLowerCase();
        
        // Check for new program request - reset user info
        if (message.includes('yeni') && (message.includes('program') || message.includes('antrenman'))) {
            this.userInfo = {}; // Reset user information
            return await this.handleProgramRequest(userMessage);
        }
        
        // Program creation flow
        if (message.includes('program') || message.includes('antrenman')) {
            return await this.handleProgramRequest(userMessage);
        }
        
        // Exercise technique questions
        if (message.includes('bench press') || message.includes('göğüs')) {
            return await this.handleExerciseQuestion('Bench Press');
        }
        
        if (message.includes('squat') || message.includes('çömelme')) {
            return await this.handleExerciseQuestion('Squat');
        }
        
        if (message.includes('deadlift') || message.includes('ölü kaldırış')) {
            return await this.handleExerciseQuestion('Deadlift');
        }
        
        // Nutrition questions
        if (message.includes('beslenme') || message.includes('diyet') || message.includes('protein')) {
            return this.handleNutritionQuestion(userMessage);
        }
        
        // Recovery questions
        if (message.includes('dinlenme') || message.includes('uyku') || message.includes('toparlanma')) {
            return this.handleRecoveryQuestion();
        }
        
        // Goal-specific questions
        if (message.includes('kas kazanımı') || message.includes('bulk')) {
            return this.handleGoalQuestion('muscle_gain');
        }
        
        if (message.includes('yağ yakımı') || message.includes('kilo verme') || message.includes('cut')) {
            return this.handleGoalQuestion('fat_loss');
        }
        
        // User info collection
        if (this.isUserInfoResponse(userMessage)) {
            return await this.collectUserInfo(userMessage);
        }
        
        return this.getDefaultResponse();
    }
    
    private async handleProgramRequest(message: string): Promise<string> {
        // Önce mesajdan bilgileri çek
        const result = await this.collectUserInfo(message);

        if (!this.userInfo.gender || !this.userInfo.experience || !this.userInfo.goal || !this.userInfo.workout_days) {
            return result;
        }

        return result;
    }
    
    private async handleExerciseQuestion(exerciseName: string): Promise<string> {
        try {
            const exercisesRef = collection(firestore, 'exercises');
            const q = query(exercisesRef, where('name', '==', exerciseName));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                return "Bu egzersiz hakkında daha spesifik bir soru sorabilir misiniz?";
            }

            const exercise = querySnapshot.docs[0].data() as Exercise;
            
            return `🏋️‍♀️ **${exercise.name} Tekniği:**

**Açıklama:**
${exercise.description}

**Hedef Kaslar:**
${exercise.targetMuscles.map(muscle => `• ${muscle}`).join('\n')}

**Ekipman:**
• ${exercise.equipment}

**Zorluk Seviyesi:**
• ${exercise.difficulty}

**Adımlar:**
${exercise.instructions.map((instruction, index) => `${index + 1}. ${instruction}`).join('\n')}`;
        } catch (error) {
            console.error('Error fetching exercise:', error);
            return "Üzgünüm, egzersiz bilgilerini getirirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
        }
    }
    
    private handleNutritionQuestion(message: string): string {
        return `🥗 **Beslenme Rehberi:**

**Temel Prensipler:**
• **Protein:** Vücut ağırlığınızın kg başına 1.6-2.2g
• **Su:** Günde en az 2.5-3 litre
• **Öğün sayısı:** 3-5 öğün düzenli saatlerde

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

💡 Detaylı beslenme planı için diyetisyene danışmanızı öneririm.`;
    }
    
    private handleRecoveryQuestion(): string {
        return `😴 **Toparlanma ve Dinlenme:**

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

**Toparlanma İşaretleri:**
• Sabah dinç uyanmak
• Motivasyon seviyesinin yüksek olması
• Kas ağrılarının azalması

⚠️ Aşırı antrenman belirtilerinde dinlenme süresini artırın.`;
    }
    
    private handleGoalQuestion(goal: string): string {
        if (goal === 'muscle_gain') {
            return `💪 **Kas Kazanımı Rehberi:**

**Antrenman:**
• Haftada 3-4 direnç antrenmanı
• Büyük kas gruplarına odaklanın
• 6-12 tekrar arası, 3-4 set
• Progressive overload uygulayın

**Beslenme:**
• Kalori fazlası (300-500 kalori)
• Protein: 2g/kg vücut ağırlığı
• Karbonhidrat: antrenman için enerji
• Sağlıklı yağlar ihmal etmeyin

**Dinlenme:**
• 48-72 saat kas grubu dinlenmesi
• 7-9 saat uyku
• Stres seviyesini düşük tutun

**Beklentiler:**
• Ayda 0.5-1 kg kas kazanımı
• İlk 3 ay hızlı gelişim
• Sabır ve tutarlılık çok önemli`;
        } else {
            return `🔥 **Yağ Yakımı Rehberi:**

**Antrenman:**
• Direnç antrenmanı + kardiyovasküler
• HIIT antrenmanları etkili
• Büyük kas grupları çalışın
• Haftada 4-5 antrenman

**Beslenme:**
• Kalori açığı (300-500 kalori)
• Yüksek protein (ağırlık koruması için)
• Kompleks karbonhidratlar
• Şeker ve işlenmiş gıda kısıtlama

**Kardiyovasküler:**
• Haftada 150-300 dk orta yoğunluk
• HIIT: 15-20 dk yüksek yoğunluk
• Yürüyüş günlük aktivite olarak

**Beklentiler:**
• Haftada 0.5-1 kg sağlıklı kayıp
• İlk haftalar hızlı, sonra yavaşlar
• Plateau dönemler normal`;
        }
    }
    
    private isUserInfoResponse(message: string): boolean {
        const message_lower = message.toLowerCase();
        return message_lower.includes('erkek') || 
               message_lower.includes('kadın') || 
               message_lower.includes('başlangıç') || 
               message_lower.includes('orta') || 
               message_lower.includes('ileri') ||
               message_lower.includes('kas kazanımı') ||
               message_lower.includes('yağ yakımı') ||
               /\d+\s*(gün|gun)/.test(message_lower);
    }
    
    private async collectUserInfo(message: string): Promise<string> {
        const message_lower = message.toLowerCase();
        // Gelişmiş regex ve anahtar kelime eşleştirme ile bilgileri çek
        // Cinsiyet
        if (/erkek/.test(message_lower)) this.userInfo.gender = 'Erkek';
        if (/kad[ıi]n/.test(message_lower)) this.userInfo.gender = 'Kadın';
        // Deneyim seviyesi
        if (/ba[sş]lang[ıi]ç/.test(message_lower)) this.userInfo.experience = 'başlangıç';
        else if (/orta/.test(message_lower)) this.userInfo.experience = 'orta seviye';
        else if (/ileri/.test(message_lower)) this.userInfo.experience = 'ileri seviye';
        // Hedef
        if (/kas kazan[ıi]m[ıi]/.test(message_lower)) this.userInfo.goal = 'kas kazanımı';
        else if (/ya[ğg] yak[ıi]m[ıi]/.test(message_lower)) this.userInfo.goal = 'yağ yakımı';
        // Gün
        const dayMatch = message_lower.match(/(\d+)\s*(gün|gun)/);
        if (dayMatch) this.userInfo.workout_days = dayMatch[1];
        // Alternatif: "haftada 4" gibi
        const haftaMatch = message_lower.match(/hafta(da)?\s*(\d+)/);
        if (haftaMatch) this.userInfo.workout_days = haftaMatch[2];
        // Alternatif: sadece sayı ve gün geçiyorsa
        if (!this.userInfo.workout_days) {
            const altDayMatch = message_lower.match(/(\d{1,2})/);
            if (altDayMatch) this.userInfo.workout_days = altDayMatch[1];
        }
        // Tüm bilgiler tamam mı?
        if (this.userInfo.gender && this.userInfo.experience && this.userInfo.goal && this.userInfo.workout_days) {
            const result = await this.generateAndSaveWorkoutProgram();
            return result;
        }
        // Eksik bilgi varsa
        const missing = [];
        if (!this.userInfo.gender) missing.push('Cinsiyet (Erkek/Kadın)');
        if (!this.userInfo.experience) missing.push('Deneyim seviyesi (Başlangıç/Orta/İleri)');
        if (!this.userInfo.goal) missing.push('Hedef (Kas kazanımı/Yağ yakımı)');
        if (!this.userInfo.workout_days) missing.push('Haftalık antrenman günü (örn: 3 gün)');
        return `📝 **Teşekkürler! Şu bilgiler de gerekli:**\n\n${missing.map(item => `• ${item}`).join('\n')}\n\nÖrnek: "Erkek, başlangıç seviyesi, kas kazanımı hedefi, haftada 3 gün"`;
    }
    
    private generateWorkoutProgram(): string {
        const { gender, experience, goal, workout_days } = this.userInfo;
        
        return `🎯 **Size Özel Antrenman Programı Oluşturuluyor...**

**Profil Özeti:**
• Cinsiyet: ${gender}
• Seviye: ${experience}
• Hedef: ${goal}
• Haftalık: ${workout_days} gün

⏳ **Program hazırlanıyor ve kaydediliyor...**

Bu bir saniye sürecek!`;
    }
    
    async generateAndSaveWorkoutProgram(): Promise<string> {
        try {
            console.log('[DEBUG] Program oluşturma başladı...');
            console.log('[DEBUG] Kullanıcı bilgileri:', this.userInfo);
            
            // Deneyim seviyesini normalize et
            this.userInfo.experience = this.normalizeExperience(this.userInfo.experience || '');
            console.log('[DEBUG] Normalize edilmiş deneyim:', this.userInfo.experience);
            
            // Call the LLM API to generate the program
            const response = await fetch('http://vps-8e6957ba.vps.ovh.net:8000/generate-program', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.userInfo),
            });

            if (!response.ok) {
                throw new Error('Failed to generate program');
            }

            const responseText = await response.text();
            console.log('[DEBUG] Raw response:', responseText);

            // Try to parse the response as JSON
            let program: WorkoutProgram;
            try {
                // First try to parse the response directly
                const data = JSON.parse(responseText);
                console.log('[DEBUG] Parsed response data:', data);

                if (!data.success) {
                    throw new Error(data.error || 'Program oluşturulamadı');
                }

                if (!data.program || typeof data.program !== 'object') {
                    throw new Error('Invalid program format: program must be an object');
                }

                // The program is already in the correct format
                program = data.program;

                console.log('[DEBUG] Program:', program);
            } catch (e) {
                console.error('[DEBUG] JSON parse hatası:', e);
                throw new Error('Program oluşturulamadı: Geçersiz program formatı');
            }

            if (!program || Object.keys(program).length === 0) {
                throw new Error('Program oluşturulamadı: Boş program');
            }

            // Validate program structure
            const days = Object.keys(program);
            if (days.length === 0) {
                throw new Error('Program oluşturulamadı: Gün bulunamadı');
            }

            for (const day of days) {
                if (!Array.isArray(program[day])) {
                    throw new Error(`Program oluşturulamadı: ${day} günü için geçersiz format`);
                }
                if (program[day].length === 0) {
                    throw new Error(`Program oluşturulamadı: ${day} günü için egzersiz bulunamadı`);
                }
                for (const exercise of program[day]) {
                    if (!exercise.exercise || !exercise.sets || !exercise.rpe) {
                        throw new Error(`Program oluşturulamadı: ${day} gününde eksik egzersiz bilgisi`);
                    }
                }
            }
            
            console.log('[DEBUG] Firebase\'e kaydetme başlıyor...');
            
            // Save program as a field in the user document
            const userDoc = doc(firestore, 'users',getAuth().currentUser?.uid); // Replace with actual user ID
            await setDoc(userDoc, { 
                program,
                userInfo: this.userInfo,
                createdAt: new Date().toISOString()
            }, { merge: true });
            
            console.log('[DEBUG] ✅ Program başarıyla kaydedildi!');
            
            // Deneyim seviyesini sakla (resetUserInfo çağrısından önce)
            const experienceLevel = this.userInfo.experience;
            
            // Reset user info after successful program generation
            this.resetUserInfo();
            
            return `🎉 **Harika! Kişisel antrenman programınız hazır!**

📋 **Program Detayları:**
• ${Object.keys(program).length} günlük antrenman programı
• Toplam ${Object.values(program).reduce((total, day) => total + day.length, 0)} egzersiz
• Deneyim seviyeniz: ${experienceLevel}

✅ **Program Firebase'e kaydedildi!**
📅 **Calendar ekranından programınızı görüntüleyebilirsiniz.**

💪 Başarılar dilerim!`;
        } catch (error) {
            console.error('[DEBUG] ❌ Program oluşturma hatası:', error);
            return `❌ **Program oluşturulurken bir hata oluştu:**

${error instanceof Error ? error.message : 'Bilinmeyen hata'}

🔄 **Lütfen tekrar deneyin veya farklı bilgiler verin.**`;
        }
    }
    
    private getDefaultResponse(): string {
        const responses = [
            "Size nasıl yardımcı olabilirim? Antrenman programları, egzersiz teknikleri, beslenme önerileri veya genel fitness konularında sorularınızı yanıtlayabilirim! 💪",
            "Fitness yolculuğunuzda size rehberlik edebilirim. Hangi konuda bilgi almak istersiniz? 🏋️‍♀️",
            "Antrenman, beslenme, toparlanma veya egzersiz teknikleri hakkında sorularınız varsa çekinmeyin! 🎯",
            "Hedefinize ulaşmak için size özel öneriler verebilirim. Ne konuda yardıma ihtiyacınız var? 🔥"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Türkçe deneyim seviyesi normalize fonksiyonu
    private normalizeExperience(exp: string) {
        const e = exp.toLowerCase();
        if (e.includes('advanced') || e.includes('ileri')) return 'ileri seviye';
        if (e.includes('intermediate') || e.includes('orta')) return 'orta seviye';
        if (e.includes('beginner') || e.includes('başlangıç')) return 'başlangıç';
        return 'başlangıç';
    }

    private resetUserInfo() {
        this.userInfo = {};
    }
}

export default new AIService(); 
