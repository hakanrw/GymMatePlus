from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json

# Add the current directory to Python path to import gemini module
sys.path.append(os.path.dirname(__file__))

try:
    from gemini import generate_workout_program, generate_chat_response
except ImportError as e:
    print(f"Error importing gemini module: {e}")
    generate_workout_program = None
    generate_chat_response = None

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

@app.route('/generate-program', methods=['POST'])
def create_workout_program():
    try:
        data = request.get_json()
        
        # Extract user information
        gender = data.get('gender', '').lower()
        experience = data.get('experience', '').lower()
        goal = data.get('goal', '').lower()
        workout_days = int(data.get('workout_days', 3))
        user_id = data.get('user_id', '')
        
        # Map Turkish terms to English for Gemini AI
        gender_map = {'erkek': 'male', 'kadın': 'female'}
        experience_map = {
            'başlangıç': 'beginner',
            'orta seviye': 'intermediate', 
            'orta': 'intermediate',
            'ileri seviye': 'advanced',
            'ileri': 'advanced'
        }
        goal_map = {
            'kas kazanımı': 'muscle_gain',
            'yağ yakımı': 'fat_loss',
            'kilo verme': 'fat_loss'
        }
        
        # Convert to English
        gender_en = gender_map.get(gender, gender)
        experience_en = experience_map.get(experience, 'beginner')
        goal_en = goal_map.get(goal, 'muscle_gain')
        
        # Call the Gemini AI function
        if generate_workout_program:
            try:
                # Create user info dict for Gemini AI
                user_info = {
                    'gender': gender_en,
                    'experience': experience_en,
                    'goal': goal_en,
                    'workout_days': workout_days,
                    'focus_area': 'full_body'  # Default focus area
                }
                
                # Generate program using Gemini AI
                program_result = generate_workout_program(user_info)
                
                # Debug: Gemini'nin döndürdüğü programı yazdır
                print(f"[DEBUG] Gemini'den dönen program:")
                print(f"[DEBUG] {program_result}")
                
                # Parse the program result
                program_data = json.loads(program_result)
                
                # Check if there's an error in the response
                if 'error' in program_data:
                    return jsonify({
                        'success': False,
                        'error': program_data['error'],
                        'user_info': {
                            'gender': gender,
                            'experience': experience,
                            'goal': goal,
                            'workout_days': workout_days
                        }
                    })
                
                # Return the program directly
                return jsonify({
                    'success': True,
                    'program': program_data['program'],
                    'user_info': {
                        'gender': gender,
                        'experience': experience,
                        'goal': goal,
                        'workout_days': workout_days
                    }
                })
                
            except Exception as e:
                print(f"Error calling Gemini AI: {e}")
                # Return fallback program if Gemini fails
                fallback_program = create_fallback_program(experience_en, goal_en, workout_days)
                return jsonify({
                    'success': True,
                    'program': fallback_program,
                    'user_info': {
                        'gender': gender,
                        'experience': experience,
                        'goal': goal,
                        'workout_days': workout_days
                    },
                    'note': 'Using fallback program due to AI unavailability'
                })
        else:
            # Gemini module not available, use fallback
            fallback_program = create_fallback_program(experience_en, goal_en, workout_days)
            return jsonify({
                'success': True,
                'program': fallback_program,
                'user_info': {
                    'gender': gender,
                    'experience': experience,
                    'goal': goal,
                    'workout_days': workout_days
                },
                'note': 'Using fallback program - Gemini AI not available'
            })
            
    except Exception as e:
        print(f"Error in create_workout_program: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def format_program_for_app(program_result, workout_days):
    """Format the Gemini AI result for the mobile app"""
    try:
        print(f"[DEBUG] format_program_for_app başladı")
        print(f"[DEBUG] program_result tipi: {type(program_result)}")
        print(f"[DEBUG] workout_days: {workout_days}")
        
        # Gemini'den gelen string'i JSON'a çevir
        if isinstance(program_result, str):
            # JSON string'ini parse et
            try:
                # Gemini bazen ```json ile başlayıp ``` ile bitirebilir
                cleaned_result = program_result.strip()
                if cleaned_result.startswith('```json'):
                    cleaned_result = cleaned_result[7:]  # ```json kısmını kaldır
                if cleaned_result.endswith('```'):
                    cleaned_result = cleaned_result[:-3]  # ``` kısmını kaldır
                
                program_data = json.loads(cleaned_result)
                print(f"[DEBUG] JSON parse edildi: {program_data}")
            except json.JSONDecodeError as e:
                print(f"[DEBUG] JSON parse hatası: {e}")
                return create_fallback_program('beginner', 'muscle_gain', workout_days)
        else:
            program_data = program_result
        
        # Gemini'nin formatı: {"program": [{"day": "Gün 1", "exercises": [...]}]}
        if isinstance(program_data, dict) and 'program' in program_data:
            program_array = program_data['program']
            print(f"[DEBUG] Program array bulundu, gün sayısı: {len(program_array)}")
            
            formatted_days = []
            for day_data in program_array:
                if isinstance(day_data, dict) and 'day' in day_data and 'exercises' in day_data:
                    formatted_exercises = []
                    for exercise in day_data['exercises']:
                        if isinstance(exercise, dict):
                            formatted_exercises.append({
                                'name': exercise.get('name', 'Unknown Exercise'),
                                'sets': exercise.get('sets', 3),
                                'reps': exercise.get('reps', '8-12'),
                                'rir': exercise.get('rir', '2-3'),
                                'weight': exercise.get('weight')
                            })
                    
                    formatted_days.append({
                        'day': day_data['day'],
                        'exercises': formatted_exercises
                    })
            
            print(f"[DEBUG] Formatlanmış gün sayısı: {len(formatted_days)}")
            return formatted_days
        
        print(f"[DEBUG] Beklenmeyen format, fallback kullanılıyor")
        return create_fallback_program('beginner', 'muscle_gain', workout_days)
        
    except Exception as e:
        print(f"[DEBUG] format_program_for_app hatası: {e}")
        return create_fallback_program('beginner', 'muscle_gain', workout_days)

def create_fallback_program(experience, goal, workout_days):
    """Create a fallback program when Gemini AI is not available"""
    if experience == 'beginner':
        base_program = [
            {
                'day': 'Gün 1 - Full Body',
                'exercises': [
                    {'name': 'Squat', 'sets': 3, 'reps': '8-12', 'rir': '2-3'},
                    {'name': 'Bench Press', 'sets': 3, 'reps': '8-12', 'rir': '2-3'},
                    {'name': 'Bent-over Row', 'sets': 3, 'reps': '8-12', 'rir': '2-3'},
                    {'name': 'Overhead Press', 'sets': 3, 'reps': '8-12', 'rir': '2-3'},
                    {'name': 'Plank', 'sets': 3, 'reps': '30-60 sn', 'rir': '1-2'}
                ]
            },
            {
                'day': 'Gün 2 - Full Body',
                'exercises': [
                    {'name': 'Deadlift', 'sets': 3, 'reps': '5-8', 'rir': '2-3'},
                    {'name': 'Dumbbell Press', 'sets': 3, 'reps': '8-12', 'rir': '2-3'},
                    {'name': 'Lat Pulldown', 'sets': 3, 'reps': '8-12', 'rir': '1-2'},
                    {'name': 'Leg Press', 'sets': 3, 'reps': '12-15', 'rir': '1-2'},
                    {'name': 'Bicep Curl', 'sets': 3, 'reps': '10-15', 'rir': '0-1'}
                ]
            },
            {
                'day': 'Gün 3 - Full Body',
                'exercises': [
                    {'name': 'Romanian Deadlift', 'sets': 3, 'reps': '8-12', 'rir': '2-3'},
                    {'name': 'Incline Dumbbell Press', 'sets': 3, 'reps': '8-12', 'rir': '2-3'},
                    {'name': 'Seated Row', 'sets': 3, 'reps': '8-12', 'rir': '1-2'},
                    {'name': 'Leg Curl', 'sets': 3, 'reps': '10-15', 'rir': '1-2'},
                    {'name': 'Tricep Extension', 'sets': 3, 'reps': '10-15', 'rir': '0-1'}
                ]
            }
        ]
    else:
        # More advanced program
        base_program = [
            {
                'day': 'Gün 1 - Üst Gövde',
                'exercises': [
                    {'name': 'Bench Press', 'sets': 4, 'reps': '6-10', 'rir': '2-3'},
                    {'name': 'Bent-over Row', 'sets': 4, 'reps': '6-10', 'rir': '2-3'},
                    {'name': 'Overhead Press', 'sets': 3, 'reps': '8-12', 'rir': '2-3'},
                    {'name': 'Lat Pulldown', 'sets': 3, 'reps': '8-12', 'rir': '1-2'},
                    {'name': 'Dips', 'sets': 3, 'reps': '8-15', 'rir': '1-2'}
                ]
            },
            {
                'day': 'Gün 2 - Alt Gövde',
                'exercises': [
                    {'name': 'Squat', 'sets': 4, 'reps': '6-10', 'rir': '2-3'},
                    {'name': 'Romanian Deadlift', 'sets': 4, 'reps': '8-12', 'rir': '2-3'},
                    {'name': 'Leg Press', 'sets': 3, 'reps': '12-20', 'rir': '1-2'},
                    {'name': 'Leg Curl', 'sets': 3, 'reps': '10-15', 'rir': '1-2'},
                    {'name': 'Calf Raise', 'sets': 4, 'reps': '15-20', 'rir': '0-1'}
                ]
            }
        ]
    
    return base_program[:workout_days]

@app.route('/chat', methods=['POST'])
def ai_chat():
    try:
        data = request.get_json()
        
        # Extract message and conversation history
        message = data.get('message', '')
        conversation_history = data.get('conversation_history', [])
        user_id = data.get('user_id', '')
        
        if not message.strip():
            return jsonify({
                'success': False,
                'error': 'Message cannot be empty'
            }), 400
        
        # Call the Gemini AI function for general chat
        if generate_chat_response:
            try:
                # Generate response using Gemini AI
                ai_response = generate_chat_response(message, conversation_history)
                
                # Check if the response is a program creation request
                try:
                    response_json = json.loads(ai_response)
                    if (response_json.get('action') == 'create_program' and 
                        'workout_days' in response_json and 
                        'goal' in response_json):
                        
                        print(f"[DEBUG] Program creation request detected in chat")
                        
                        # Get user profile from database (you'll need to implement this)
                        user_profile = get_user_profile_from_db(user_id)
                        if not user_profile:
                            return jsonify({
                                'success': True,
                                'response': 'Üzgünüm, profilinizi bulamadım. Lütfen önce profil bilgilerinizi tamamlayın.',
                                'timestamp': data.get('timestamp', '')
                            })
                        
                        # Create user info for program generation
                        user_info = {
                            'gender': user_profile.get('gender', 'erkek').lower(),
                            'experience': user_profile.get('experience', 'başlangıç').lower(),
                            'goal': response_json['goal'],
                            'workout_days': int(response_json['workout_days']),
                            'focus_area': 'full_body'
                        }
                        
                        # Map goal from English to Turkish for user display
                        goal_display_map = {
                            'muscle_gain': 'kas kazanımı',
                            'fat_loss': 'yağ yakımı'
                        }
                        
                        print(f"[DEBUG] Generating program with user_info: {user_info}")
                        
                        # Generate the program
                        program_result = generate_workout_program(user_info)
                        program_data = json.loads(program_result)
                        
                        if 'error' in program_data:
                            return jsonify({
                                'success': True,
                                'response': f"Program oluşturulurken bir hata oluştu: {program_data['error']}",
                                'timestamp': data.get('timestamp', '')
                            })
                        
                        # Format success response with program
                        success_message = f"""🎉 **Harika! Sizin için özel antrenman programı hazırladım!**

📊 **Program Detayları:**
• Hedef: {goal_display_map.get(response_json['goal'], response_json['goal'])}
• Süre: {response_json['workout_days']} gün/hafta
• Seviye: {user_profile.get('experience', 'Başlangıç')}

💪 Programınız başarıyla oluşturuldu ve profilinize kaydedildi. "Programlarım" sekmesinden detaylarını görüntüleyebilirsiniz.

Başarılı antrenmanlar dilerim! Herhangi bir sorunuz olursa çekinmeyin."""
                        
                        return jsonify({
                            'success': True,
                            'response': success_message,
                            'program_created': True,
                            'program': program_data.get('program', {}),
                            'user_info': {
                                'goal': goal_display_map.get(response_json['goal'], response_json['goal']),
                                'workout_days': response_json['workout_days'],
                                'experience': user_profile.get('experience', 'Başlangıç')
                            },
                            'timestamp': data.get('timestamp', '')
                        })
                        
                except json.JSONDecodeError:
                    # Not a JSON response, treat as normal chat
                    pass
                
                # Normal chat response
                return jsonify({
                    'success': True,
                    'response': ai_response,
                    'timestamp': data.get('timestamp', '')
                })
                
            except Exception as e:
                print(f"Error calling Gemini AI for chat: {e}")
                # Return fallback response if Gemini fails
                fallback_response = get_fallback_chat_response(message)
                return jsonify({
                    'success': True,
                    'response': fallback_response,
                    'note': 'Using fallback response due to AI unavailability'
                })
        else:
            # Gemini module not available, use fallback
            fallback_response = get_fallback_chat_response(message)
            return jsonify({
                'success': True,
                'response': fallback_response,
                'note': 'Using fallback response - Gemini AI not available'
            })
            
    except Exception as e:
        print(f"Error in ai_chat: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def get_user_profile_from_db(user_id):
    """
    Get user profile from Firebase Firestore
    Returns user profile with gender and experience fields
    """
    try:
        # Import Firebase here to avoid circular imports
        import firebase_admin
        from firebase_admin import firestore
        
        # Get Firestore client (assuming Firebase is already initialized)
        db = firestore.client()
        
        # Query user document
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if user_doc.exists:
            user_data = user_doc.to_dict()
            print(f"[DEBUG] User profile found: {user_data}")
            return user_data
        else:
            print(f"[DEBUG] User profile not found for user_id: {user_id}")
            return None
            
    except Exception as e:
        print(f"[ERROR] Failed to get user profile from database: {e}")
        return None

def get_fallback_chat_response(message):
    """Provide fallback responses when Gemini AI is not available"""
    message_lower = message.lower()
    
    if any(word in message_lower for word in ['program', 'antrenman', 'workout']):
        return """💪 **Antrenman Programı**

Program oluşturmak için şu bilgileri paylaşabilir misiniz:
• Cinsiyetiniz (Erkek/Kadın)
• Deneyim seviyeniz (Başlangıç/Orta/İleri)
• Hedefiniz (Kas kazanımı/Yağ yakımı)
• Haftada kaç gün antrenman yapmak istiyorsunuz?

Bu bilgilerle size özel bir program hazırlayabilirim!"""

    elif any(word in message_lower for word in ['beslenme', 'diyet', 'protein', 'nutrition']):
        return """🥗 **Beslenme Rehberi**

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

Daha detaylı beslenme planı için lütfen diyetisyene danışın."""

    elif any(word in message_lower for word in ['dinlenme', 'uyku', 'recovery', 'toparlanma']):
        return """😴 **Toparlanma ve Dinlenme**

**Uyku:**
• Günde 7-9 saat kaliteli uyku
• Düzenli uyku saatleri
• Yatak odası serin ve karanlık

**Dinlenme Günleri:**
• Haftada en az 1-2 tam dinlenme günü
• Aktif dinlenme: hafif yürüyüş, germe
• Aynı kas grubunu ardışık günlerde çalıştırmayın

Toparlanma antrenmanın en az antrenman kadar önemli bir parçasıdır!"""

    else:
        return """🤖 **GymMate+ AI Antrenör**

Merhaba! Size şu konularda yardımcı olabilirim:

💪 **Antrenman Programları**
🥗 **Beslenme Rehberi** 
😴 **Toparlanma Tavsiyeleri**
🏋️‍♀️ **Egzersiz Teknikleri**
📊 **Fitness Hedefleri**

Hangi konuda yardıma ihtiyacınız var?"""

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'gemini_available': generate_workout_program is not None})

if __name__ == '__main__':
    print("Starting AI Server...")
    print(f"Gemini AI available: {generate_workout_program is not None}")
    app.run(host='0.0.0.0', port=8000, debug=True) 