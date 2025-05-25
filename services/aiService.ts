import programService from './programService';

interface UserInfo {
    gender?: string;
    experience?: string;
    goal?: string;
    workout_days?: string;
    focus_area?: string;
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
            return this.handleExerciseQuestion('bench_press');
        }
        
        if (message.includes('squat') || message.includes('çömelme')) {
            return this.handleExerciseQuestion('squat');
        }
        
        if (message.includes('deadlift') || message.includes('ölü kaldırış')) {
            return this.handleExerciseQuestion('deadlift');
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
    
    private handleExerciseQuestion(exercise: string): string {
        const exercises: Record<string, string> = {
            bench_press: `🏋️‍♀️ **Bench Press Tekniği:**

**Başlangıç Pozisyonu:**
• Sırtınızı düz tutarak banka uzanın
• Omuz genişliğinden biraz geniş tutuş
• Ayaklarınızı yere sıkıca bastırın

**Hareket:**
• Barı kontrollü şekilde göğsünüze indirin
• Güçlü bir şekilde yukarı itin
• Nefes verirken itin, çekerken alın

**Yaygın Hatalar:**
• Sırtı aşırı kavisli tutmak
• Barı çok hızlı indirmek
• Tam hareket genliği kullanmamak`,

            squat: `🏋️‍♂️ **Squat Tekniği:**

**Başlangıç Pozisyonu:**
• Ayakları omuz genişliğinde açın
• Parmak uçları hafif dışa dönük
• Sırt düz, göğüs açık

**Hareket:**
• Kalçanızı geriye doğru itin
• Dizlerinizi ayak parmaklarınız hizasında bükün
• Uyluk kası yere paralel olana kadar inin
• Topukları yere basarak kalkın

**İpuçları:**
• Dizler içe kaçmasın
• Ağırlık topuklarda olsun
• Nefes alarak inin, vererek kalkın`,

            deadlift: `💪 **Deadlift Tekniği:**

**Başlangıç Pozisyonu:**
• Ayakları kalça genişliğinde
• Bar ayak orta kısmında
• Omuzlar barın hafif önünde

**Hareket:**
• Kalça ve dizleri aynı anda bükerek inin
• Sırtı düz tutun
• Barı vücuda yakın tutarak kaldırın
• Kalça ve dizleri aynı anda açın

**Güvenlik:**
• Sırt hiçbir zaman yuvarlak olmasın
• Ağır ağırlıklarda kemeri kullanın
• Hareket hızını kontrol edin`
        };
        
        return exercises[exercise] || "Bu egzersiz hakkında daha spesifik bir soru sorabilir misiniz?";
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
        if (/başlang[ıi]ç/.test(message_lower)) this.userInfo.experience = 'başlangıç';
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
            
            const program = await programService.generateProgramWithGemini(this.userInfo);
            console.log('[DEBUG] Gemini\'den program alındı, gün sayısı:', program.length);
            
            if (program.length === 0) {
                throw new Error('Program oluşturulamadı');
            }
            
            console.log('[DEBUG] Firebase\'e kaydetme başlıyor...');
            const programId = await programService.saveWorkoutProgram(this.userInfo, program);
            console.log('[DEBUG] ✅ Program başarıyla kaydedildi! ID:', programId);
            
            // Deneyim seviyesini sakla (resetUserInfo çağrısından önce)
            const experienceLevel = this.userInfo.experience;
            
            // Reset user info after successful program generation
            this.resetUserInfo();
            
            return `🎉 **Harika! Kişisel antrenman programınız hazır!**

📋 **Program Detayları:**
• ${program.length} günlük antrenman programı
• Toplam ${program.reduce((total, day) => total + day.exercises.length, 0)} egzersiz
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