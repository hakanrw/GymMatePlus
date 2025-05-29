import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
import firebase_admin
from firebase_admin import credentials, firestore

# Firebase initialization
cred = credentials.Certificate("../firebase_import/auth_export/serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

os.environ["GOOGLE_API_KEY"] = "AIzaSyDA_daznjF8sIwy6p63qic-ZYlSRZ2Nas4"

def get_level_specific_data(experience_level):
    try:
        # Map experience levels to Firebase difficulty levels
        level_mapping = {
            "easy": ["Beginner"],
            "medium": ["Beginner", "Intermediate"],
            "hard": ["Beginner", "Intermediate", "Advanced"]
        }

        difficulty = level_mapping.get(experience_level.lower(), ["Beginner"])
        print(f"[DEBUG] Fetching exercises for difficulty level: {difficulty}")

        # Query Firestore for exercises with the specified difficulty
        exercises_ref = db.collection('exercises')
        query = exercises_ref.where('difficulty', 'in', difficulty)
        exercises = query.get()

        if not exercises:
            print(f"[DEBUG] No exercises found for difficulty level: {difficulty}")
            return None

        # Convert Firestore documents to a list of dictionaries
        exercises_list = []
        for doc in exercises:
            exercise_data = doc.to_dict()
            exercises_list.append(exercise_data)

        print(f"[DEBUG] Successfully fetched {len(exercises_list)} exercises")
        return exercises_list

    except Exception as e:
        print(f"[ERROR] Failed to fetch exercises from Firebase: {e}")
        return None

def get_progression_data():
    try:
        # Query Firestore for progression data
        progression_ref = db.collection('progression')
        progression_docs = progression_ref.get()

        if not progression_docs:
            print("[DEBUG] No progression data found")
            return None

        # Convert Firestore documents to a list of dictionaries
        progression_list = []
        for doc in progression_docs:
            progression_data = doc.to_dict()
            progression_list.append(progression_data)

        print(f"[DEBUG] Successfully fetched progression data")
        return progression_list

    except Exception as e:
        print(f"[ERROR] Failed to fetch progression data from Firebase: {e}")
        return None

def get_exercises_logic_data():
    try:
        # Query Firestore for exercise logic data
        exercises_ref = db.collection('exercises')
        exercises = exercises_ref.get()

        if not exercises:
            print("[DEBUG] No exercise logic data found")
            return None

        # Convert Firestore documents to a list of dictionaries
        exercises_list = []
        for doc in exercises:
            exercise_data = doc.to_dict()
            exercises_list.append(exercise_data)

        print(f"[DEBUG] Successfully fetched exercise logic data")
        return exercises_list

    except Exception as e:
        print(f"[ERROR] Failed to fetch exercise logic data from Firebase: {e}")
        return None

def generate_workout_program(user_info):
    try:
        print(f"[DEBUG] {user_info['experience']} seviyesi için program oluşturuluyor...")

        level_data = get_level_specific_data(user_info['experience'])
        if level_data:
            print(f"[DEBUG] JSON verisi başarıyla yüklendi.")
        else:
            print(f"[DEBUG] JSON verisi yüklenemedi! Program oluşturulamıyor.")
            return "Program oluşturulamadı: Deneyim seviyesine uygun JSON verisi yüklenemedi."

        print(f"[DEBUG] LLM başlatılıyor...")

        llm = ChatGoogleGenerativeAI(model="models/gemini-2.5-flash-preview-04-17") 

        print(f"[DEBUG] LLM başlatıldı, prompt hazırlanıyor...")

        level_specific_json = json.dumps(level_data, ensure_ascii=False, indent=2)

        prompt_text = f"""
Sen GymMate+ uygulamasının AI antrenörüsün. Görevin, kullanıcının bilgilerine göre GymMate+ AI mantığına uygun bir antrenman programı oluşturmak.

!!!!! ÇOK ÖNEMLİ: KULLANICI {user_info['workout_days']} GÜNLÜK PROGRAM İSTEDİ. KESINLIKLE TAM OLARAK {user_info['workout_days']} GÜN OLUŞTUR. 3 GÜN DEĞİL, {user_info['workout_days']} GÜN! !!!!!

EĞER {user_info['workout_days']} GÜN OLUŞTURMAZSAN YANLIŞ YAPMIŞ OLURSUN!

Kullanıcı Profili:
- Cinsiyet: {user_info['gender']} (kadınlar için daha fazla alt vücut, erkekler için üst vücut ağırlıklı)
- Deneyim: {user_info['experience']} (başlangıç: basit hareketler, orta/ileri: kompleks hareketler)
- Hedef: {user_info['goal']} (kas kazanımı: ağır ağırlık/az tekrar, yağ yakımı: orta ağırlık/çok tekrar)
- ANTRENMAN GÜN SAYISI: {user_info['workout_days']} GÜN (KESINLIKLE BU KADAR GÜN OLUŞTUR!)

Program yapısı {user_info['workout_days']} gün için:
- 3 gün: Full body her gün
- 4 gün: Upper/Lower split
- 5 gün: Push/Pull/Legs + Upper/Lower
- 6 gün: Push/Pull/Legs/Push/Pull/Legs

Yalnızca aşağıdaki JSON formatına sadık kalarak çıktı üret. Kesinlikle sadece JSON döndür, başka hiçbir metin ekleme:

{{
  "program": {{
    "Monday": [
      {{"exercise": "Squats", "sets": "3x8-10", "rpe": "7-8"}},
      {{"exercise": "Bench Press", "sets": "4x6-8", "rpe": "7-8"}},
      {{"exercise": "Bicep Curls", "sets": "3x10-12", "rpe": "6-7"}}
    ],
    "Wednesday": [
      {{"exercise": "Squats", "sets": "3x5", "rpe": "8-9"}},
      {{"exercise": "Push-ups", "sets": "3x8-12", "rpe": "7-8"}},
      {{"exercise": "Hammer Curls", "sets": "3x10", "rpe": "6-7"}}
    ],
    "Friday": [
      {{"exercise": "Bench Press", "sets": "3x8", "rpe": "7-8"}},
      {{"exercise": "Squats", "sets": "3x10", "rpe": "6-7"}},
      {{"exercise": "Treadmill Running", "sets": "20 min", "rpe": "6-7"}}
    ]
  }}
}}

KURALLAR:
1. KESINLIKLE TAM OLARAK {user_info['workout_days']} GÜN OLUŞTUR - DAHA AZ VEYA FAZLA DEĞİL!
2. {user_info['goal']} hedefine uygun egzersizler seç
3. {user_info['experience']} seviyesine uygun zorluk
4. {user_info['gender']} cinsiyetine uygun program yapısı
5. Kesinlikle sadece JSON döndür, açıklama ekleme
6. Program objesinde {user_info['workout_days']} adet gün olmalı
7. Her egzersiz için exercise, sets ve rpe alanları olmalı
8. Sadece ve sadece altta verilen JSON verisindeki programlar arasından seçim yap

!!!!! ÖNEMLİ: Sadece altta verilen JSON verisindeki programlar arasından seçim yap !!!!!

İşte seviye bazlı JSON verisi:
{level_specific_json}
        """

        print(f"[DEBUG] Prompt hazırlandı, LLM'e gönderiliyor...")

        from langchain_core.messages import HumanMessage
        result = llm.invoke([HumanMessage(content=prompt_text)])

        print(f"[DEBUG] LLM yanıt verdi.")
        print(f"[DEBUG] Gemini'den dönen program: {result.content}")

        # Try to parse the response as JSON
        try:
            program_json = json.loads(result.content)
            if not program_json.get('program'):
                raise ValueError("Program field is missing in LLM response")
            return json.dumps(program_json)
        except json.JSONDecodeError as e:
            print(f"[DEBUG] JSON parse hatası: {e}")
            # If JSON parsing fails, try to extract JSON from the response
            import re
            json_match = re.search(r'\{.*\}', result.content, re.DOTALL)
            if json_match:
                try:
                    program_json = json.loads(json_match.group())
                    if not program_json.get('program'):
                        raise ValueError("Program field is missing in extracted JSON")
                    return json.dumps(program_json)
                except json.JSONDecodeError:
                    print(f"[DEBUG] JSON extraction failed")
                    return json.dumps({
                        "program": {},
                        "error": "Program oluşturulurken bir hata oluştu: JSON formatı geçersiz"
                    })
            else:
                return json.dumps({
                    "program": {},
                    "error": "Program oluşturulurken bir hata oluştu: JSON formatı bulunamadı"
                })

    except Exception as e:
        print(f"Program oluşturulurken hata oluştu: {e}")
        import traceback
        traceback.print_exc()
        return json.dumps({
            "program": {},
            "error": f"Program oluşturulurken bir hata oluştu: {str(e)}"
        })

def process_exercise_feedback(exercise_name, volume, intensity, weight, feedback_data, user_experience, progression, exercises):

    try:
        print(f"[DEBUG] {exercise_name} için geri bildirim işleniyor...")

        level_data = get_level_specific_data(user_experience)
        if level_data:
            print(f"[DEBUG] JSON verisi başarıyla yüklendi.")
        else:
            print(f"[DEBUG] JSON verisi yüklenemedi! Geri bildirim işlenemiyor.")
            return "Geri bildirim işlenemedi: Deneyim seviyesine uygun JSON verisi yüklenemedi."

        print(f"[DEBUG] LLM başlatılıyor...")

        llm = ChatGoogleGenerativeAI(model="models/gemini-2.5-flash-preview-04-17")

        print(f"[DEBUG] LLM başlatıldı, prompt hazırlanıyor...")

        level_specific_json = json.dumps(level_data, ensure_ascii=False, indent=2)

        prompt_text = f"""
Sen GymMate+ uygulamasının AI antrenörüsün. Görevin, kullanıcının egzersiz geri bildirimlerine göre GymMate+ AI mantığına uygun öneriler sunmak.

Aşağıdaki JSON formatında yalnızca gerekli değişikliği ver. Döndürmen gereken değer, yeni bir hareket de olabilir. Aynı hareketin farklı set ve tekrarı da.
Eğer sana gelen veride hareketin set ve tekrarı, aralık şeklindeyse, Örneğin: 3x10-15, kişi daha programa yeni başlamıştır,
alt sınırı baz al, yani hareket arttırılmaya müsaitse aynı hareketi 3x12 olarak dönmelisin. Alt veya üst sınıra ulaşıldığında, ağırlık 2.5 arttırılır veya azaltılır. Bu dosyayı incele ve yanıtlarını bu dosyaya göre ver {progression}:
NOT: Eğer hareketi başka bir hareket ile değiştireceksen, program ilk oluşturulduğunda olduğu gibi set ve tekrar aralığı vermelisin. 
Örnek: Bench Press değişmeli ise -> Dumbell Press olarak ismi değiştirip, volume'e ise 3x8-12 yazmalısın. 
{{
  "recommendation": {{
    "original": "{exercise_name}",
    "suggested": "Yeni Egzersiz ya da yine aynı egzersiz {exercise_name} ismini yaz", 
    "Weight" : "Agirligi gir"
    "Volume": 3x12
    "RIR": "1-2"
  }}
}}

Yalnızca bu yapıda yanıt ver. Açıklama, analiz, açıklayıcı cümle veya başka bilgi ekleme.

Deneyim seviyesi: {user_experience}
Egzersiz ismi, hacmi, şiddeti ve ağırlık(kg): {exercise_name}, {volume}, {intensity}, {weight}
Tamamlandı mı: {feedback_data['achived']}
Eklem Ağrısı: {feedback_data['joint_pain']}/5
Pump Etkisi: {feedback_data['pump']}/5


JSON dokümanı:
{level_specific_json}
        """

        from langchain_core.messages import HumanMessage
        result = llm.invoke([HumanMessage(content=prompt_text)])

        print(f"[DEBUG] LLM yanıt verdi.")

        return result.content

    except Exception as e:
        print(f"Egzersiz geri bildirimi işlenirken hata oluştu: {e}")
        import traceback
        traceback.print_exc()
        return f"Egzersiz değerlendirmesi sırasında bir hata oluştu: {str(e)}"

def test_gymmate_ai():
    user1 = {
        "gender": "Erkek",
        "experience": "başlangıç",
        "goal": "kas kazanımı",
        "workout_days": "3"
    }

    user2 = {
        "gender": "Kadın",
        "experience": "orta seviye",
        "goal": "yağ yakımı",
        "workout_days": "4"
    }

    user3 = {
        "gender": "Erkek",
        "experience": "ileri seviye",
        "goal": "kas kazanımı",
        "workout_days": "5",
        "focus_area": "göğüs"
    }

    
    progress = get_progression_data()
    exercises = get_exercises_logic_data()
    print("\n--- EGZERSİZ GERİ BİLDİRİM ANALİZİ ---")

    feedback1 = {   
        "achived" : True,
        "joint_pain": 4,
        "pump": 3,
    }
    feedback2 = {
        "achived" : True,
        "joint_pain": 1,
        "pump": 1
    }
    feedback3 = {
        "achived" : False,
        "joint_pain": 5,
        "pump": 0
    }
    feedback4 = {
        "achived" : True,
        "joint_pain": 0,
        "pump": 0
    }
    feedback5 = {
        "achived" : True,
        "joint_pain": 0,
        "pump": 3
    }
    feedback6 = {
        "achived" : False,
        "joint_pain": 5,
        "pump": 2
    }
    feedback7 = {
        "achived" : True,
        "joint_pain": 0,
        "pump": 0
    }
    print("Bench Press, 5x5, farklı hareket önermeli")
    result1 = process_exercise_feedback("Bench Press","5x5","RIR: 1", 50, feedback1, "başlangıç",progress,exercises)
    print(result1)
    print("Barbell curl, 3x10, hareket sabit kalmalı")
    result2 = process_exercise_feedback("Barbell Curl","3x10","RIR: 0", 20, feedback2, "orta seviye",progress,exercises)
    print(result2)
    print("BB row, 5x5, hareket değiştirilmeli")
    result3 = process_exercise_feedback("Barbell Bent-Over Row","5x5","RIR: 0", 60, feedback3, "orta seviye",progress,exercises)
    print(result3)
    print("Side raise 3x15, ağırlık arttırılmadan aynı set ve tekrar önerilmeli.")
    result4 = process_exercise_feedback("Side Raise","3x15","RIR: 0", 10, feedback4, "orta seviye",progress,exercises)
    print(result4)
    print("Incline Chest Press, 4x8 vermeli veya direkt 2.5 arttırmalı")
    result5 = process_exercise_feedback("Incline Chest Press","4x6","RIR: 2", 80, feedback5, "ileri seviye",progress,exercises)
    print(result5)
    print("Deadlift, ağırlık 4 kademe düşürülmeli")
    result6 = process_exercise_feedback("Deadlift","3x5","RIR: 0", 200,  feedback6, "ileri seviye",progress,exercises)
    print(result6)
    print("Facepull, 3x10 şeklinde kalmalı. ")
    result7 = process_exercise_feedback("Facepull","3x10","RIR: 1", 15, feedback7 , "başlangıç",progress,exercises)
    print(result7)

def generate_chat_response(message, conversation_history=None):
    """
    Generate AI chat response using Gemini for general fitness conversations
    """
    try:
        print(f"[DEBUG] Generating chat response for message: {message}")
        
        # Initialize LLM
        llm = ChatGoogleGenerativeAI(model="models/gemini-2.5-flash-preview-04-17")
        
        # Get exercise data for context
        exercises_data = get_exercises_logic_data()
        exercises_context = ""
        if exercises_data:
            exercises_context = json.dumps(exercises_data[:10], ensure_ascii=False, indent=2)  # Limit context size
        
        # Build conversation context
        conversation_context = ""
        if conversation_history and len(conversation_history) > 0:
            conversation_context = "\n\n**Önceki Konuşma:**\n"
            for msg in conversation_history[-6:]:  # Last 6 messages for context
                role = "Kullanıcı" if msg.get('isUser', False) else "AI"
                conversation_context += f"{role}: {msg.get('text', '')}\n"
            conversation_context += "\n"
        
        # Create comprehensive fitness AI prompt with program detection
        prompt_text = f"""
Sen GymMate+ uygulamasının uzman AI fitness antrenörüsün. Türkçe veya kullanıcı ingilizce konuşursa ingilizce konuş ve kullanıcılara fitness, beslenme, antrenman ve sağlık konularında profesyonel yardım sağla.

**ÖNEMLİ: PROGRAM OLUŞTURMA ALGISI**
Eğer kullanıcı antrenman programı oluşturmak istiyorsa ve gerekli bilgileri verdiyse, normal yanıt yerine aşağıdaki JSON formatında özel bir yanıt döndür:

```json
{{
  "action": "create_program",
  "workout_days": [3, 4, 5, veya 6],
  "goal": "muscle_gain" veya "fat_loss"
}}
```

**Program Oluşturma Koşulları:**
1. Kullanıcı açıkça program istemiş olmalı (kelimeler: "program", "antrenman", "workout", "plan")
2. Haftada kaç gün bilgisi verilmiş olmalı (3-6 arası)
3. Hedef belirtilmiş olmalı (kas kazanımı = "muscle_gain", yağ yakımı/kilo verme = "fat_loss")

**Hedef Eşleştirme:**
- "kas kazanımı", "kas geliştirme", "bulk", "mass" → "muscle_gain"
- "yağ yakımı", "kilo verme", "zayıflama", "cutting", "form" → "fat_loss"

**Eksik Bilgi Varsa:**
Normal sohbet yanıtı vererek eksik bilgileri sor. JSON döndürme!

**Uzmanlık Alanların:**
- Antrenman programları ve egzersiz teknikleri
- Beslenme ve diyet tavsiyeleri  
- Toparlanma ve dinlenme rehberi
- Kas kazanımı ve yağ yakımı stratejileri
- Fitness motivasyonu ve hedef belirleme
- Yaralanma önleme ve rehabilitasyon

**İletişim Kuralların:**
1. Sıcak, destekleyici ve profesyonel ol
2. Karmaşık konuları basit dille açıkla
3. Emoji kullanarak mesajları görsel olarak zenginleştir
4. Güvenlik her zaman öncelik - sağlık sorunları için doktora yönlendir
5. Kişiselleştirilmiş tavsiyeler ver
6. Motivasyonu artıracak pozitif dil kullan

**Mevcut Egzersiz Bilgisi Bankası:**
{exercises_context}

{conversation_context}

**Kullanıcının Şu Anki Mesajı:** {message}

EĞER PROGRAM OLUŞTURMA KOŞULLARI SAĞLANIYORSA: JSON formatında yanıt ver
AKSI HALDE: Normal sohbet yanıtı ver
        """
        
        print(f"[DEBUG] Sending prompt to Gemini...")
        
        from langchain_core.messages import HumanMessage
        result = llm.invoke([HumanMessage(content=prompt_text)])
        
        print(f"[DEBUG] Gemini chat response received: {result.content}")
        
        # Check if the response is a program creation JSON
        response_content = result.content.strip()
        
        # Try to detect and parse JSON response
        import re
        json_match = re.search(r'```json\s*(\{.*?\})\s*```', response_content, re.DOTALL)
        if not json_match:
            json_match = re.search(r'(\{.*?"action".*?\})', response_content, re.DOTALL)
        
        if json_match:
            try:
                json_str = json_match.group(1) if json_match.groups() else json_match.group()
                program_request = json.loads(json_str)
                
                if (program_request.get('action') == 'create_program' and 
                    'workout_days' in program_request and 
                    'goal' in program_request):
                    
                    print(f"[DEBUG] Program creation request detected: {program_request}")
                    return json.dumps(program_request)
                    
            except json.JSONDecodeError as e:
                print(f"[DEBUG] Failed to parse JSON from response: {e}")
        
        # If not a program request, return normal chat response
        return response_content
        
    except Exception as e:
        print(f"[ERROR] Error generating chat response: {e}")
        return f"Üzgünüm, şu anda teknik bir sorun yaşıyorum. Sorunuzu tekrar sorabilir misiniz? Hata: {str(e)}"

if __name__ == "__main__":
    test_gymmate_ai()
