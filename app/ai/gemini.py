import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI

os.environ["GOOGLE_API_KEY"] = "AIzaSyDA_daznjF8sIwy6p63qic-ZYlSRZ2Nas4"

def get_level_specific_data(experience_level):
    level_mapping = {
        "başlangıç": "beginner-level.json",
        "orta seviye": "intermediate-level.json",
        "ileri seviye": "advanced-level.json",
    }

    file_name = level_mapping.get(experience_level.lower())
    if not file_name:
        print(f"Uyarı: Geçersiz deneyim seviyesi: {experience_level}. Varsayılan olarak beginner-level.json kullanılıyor.")
        file_name = "beginner-level.json"

    try:
        with open(file_name, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"HATA: JSON dosyası '{file_name}' bulunamadı. Lütfen dosya yolunu kontrol edin.")
        return None
    except Exception as e:
        print(f"JSON dosyası '{file_name}' yüklenemedi: {e}")
        return None
    
def get_progression_data():
    progression = "progress-logic.json"
    try:
        with open(progression, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"HATA: JSON dosyası '{progression}' bulunamadı. Lütfen dosya yolunu kontrol edin.")
        return None
    except Exception as e:
        print(f"JSON dosyası '{progression}' yüklenemedi: {e}")
        return None
def get_exercises_logic_data():
    progression = "exercise-logic.json"
    try:
        with open(progression, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"HATA: JSON dosyası '{progression}' bulunamadı. Lütfen dosya yolunu kontrol edin.")
        return None
    except Exception as e:
        print(f"JSON dosyası '{progression}' yüklenemedi: {e}")
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

Yalnızca aşağıdaki JSON formatına sadık kalarak çıktı üret:

{{
  "program": [
    {{
      "day": "Gün 1",
      "exercises": [
        {{ "name": "Egzersiz Adı", "sets": 3, "reps": "8-12", "rir": "1-2" }}
      ]
    }}
  ]
}}

Kesinlikle sadece bu yapıya uygun JSON verisi döndür. Açıklama, yorum, açıklayıcı metin, selamlama veya başka herhangi bir doğal dil cümlesi ekleme.

İşte seviye bazlı JSON verisi:
{level_specific_json}

Kullanıcı Bilgileri:
- Cinsiyet: {user_info['gender']}
- Deneyim: {user_info['experience']}
- Hedef: {user_info['goal']}
- Antrenman Günü Sayısı: {user_info['workout_days']}
- Odak Bölge: {user_info.get('focus_area', "Belirtilmemiş")}
        """

        print(f"[DEBUG] Prompt hazırlandı, LLM'e gönderiliyor...")

        from langchain_core.messages import HumanMessage
        result = llm.invoke([HumanMessage(content=prompt_text)])

        print(f"[DEBUG] LLM yanıt verdi.")

        return result.content

    except Exception as e:
        print(f"Program oluşturulurken hata oluştu: {e}")
        import traceback
        traceback.print_exc()
        return f"Program oluşturulurken bir hata oluştu: {str(e)}"

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


if __name__ == "__main__":
    test_gymmate_ai()
