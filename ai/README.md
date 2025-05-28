# GymMate+ AI Server

This directory contains the Gemini AI server implementation for GymMate+ chat functionality.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Google API Key for Gemini AI
- Firebase Service Account Key

### Installation

1. **Install Dependencies**
   ```bash
   cd ai
   pip install -r requirements.txt
   ```

2. **Setup Firebase**
   - Place your Firebase service account key at: `../firebase_import/auth_export/serviceAccountKey.json`
   - Or update the path in `gemini.py` line 8

3. **Setup Google API Key**
   - Get your Gemini API key from Google AI Studio
   - Update line 10 in `gemini.py` with your key:
   ```python
   os.environ["GOOGLE_API_KEY"] = "your-api-key-here"
   ```

4. **Start the Server**
   ```bash
   python ai_server.py
   ```

The server will start on `http://localhost:5000`

## 📱 React Native Configuration

The React Native app is already configured to connect to the AI server:

- **Development**: `http://10.0.2.2:5000` (Android Emulator)
- **iOS Simulator**: `http://localhost:5000`
- **Production**: Update the URL in `services/aiService.ts`

## 🤖 Features

### Chat Endpoint (`/chat`)
- **URL**: `POST /chat`
- **Purpose**: General fitness AI conversations
- **Features**:
  - Conversation history awareness
  - Exercise database integration
  - Personalized fitness advice
  - Nutrition guidance
  - Recovery recommendations

### Program Generation (`/generate-program`)
- **URL**: `POST /generate-program`
- **Purpose**: Create personalized workout programs
- **Input**: User profile (gender, experience, goals, workout days)
- **Output**: Structured workout program

## 🧠 AI Capabilities

The Gemini AI is trained to:
- Provide expert fitness advice
- Remember conversation context
- Access exercise database
- Create personalized programs
- Answer nutrition questions
- Give recovery guidance
- Maintain motivational tone

## 🔧 Development

### Adding New Features

1. **Add new endpoints** in `ai_server.py`
2. **Extend Gemini functions** in `gemini.py`
3. **Update React Native service** in `services/aiService.ts`

### Testing

```bash
# Test server health
curl http://localhost:5000/health

# Test chat functionality
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Merhaba", "user_id": "test"}'
```

## 📊 File Structure

```
ai/
├── ai_server.py          # Flask server with endpoints
├── gemini.py             # Gemini AI integration
├── requirements.txt      # Python dependencies
├── exercise-logic.json   # Exercise data structure
├── progress-logic.json   # Progress tracking logic
└── README.md            # This file
```

## ⚠️ Troubleshooting

### Common Issues

1. **Import Error: gemini module**
   - Check if `gemini.py` exists
   - Verify Python path is correct

2. **Firebase Connection Error**
   - Verify service account key path
   - Check Firebase permissions

3. **React Native Can't Connect**
   - Use `10.0.2.2:5000` for Android Emulator
   - Use `localhost:5000` for iOS Simulator
   - Check firewall settings

4. **Gemini API Error**
   - Verify API key is correct
   - Check API quotas/limits
   - Ensure API is enabled

### Logs

The server provides detailed logs for debugging:
- `[DEBUG]` messages show AI processing steps
- `[ERROR]` messages indicate failures
- Network requests are logged with timestamps

## 🌟 AI Enhancement Tips

1. **Context Management**: The AI remembers last 6 messages for context
2. **Exercise Database**: Automatically queries Firebase for exercise data
3. **Fallback Responses**: Graceful handling when Gemini is unavailable
4. **Turkish Language**: Optimized for Turkish fitness conversations

## 📈 Performance

- **Response Time**: ~2-5 seconds for chat responses
- **Context Limit**: Last 6 messages maintained
- **Timeout**: 30 seconds for AI requests
- **Fallback**: Instant local responses when AI unavailable

---

**Happy Training! 💪** 