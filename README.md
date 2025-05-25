# GymMate+ 🏋️‍♂️

A comprehensive fitness and gym management mobile application built with React Native and Firebase. GymMate+ connects gym members with coaches, provides exercise databases, program management, and social features for a complete fitness experience.

## 🌟 Features

### 👤 User Management
- **Google Authentication** - Secure sign-in with Google accounts
- **User Profiles** - Comprehensive profile setup with fitness goals, measurements, and preferences
- **Role-based Access** - Support for regular users, coaches, and admins
- **Gym Selection** - Users can select and join specific gyms

### 🏃‍♂️ Exercise Database
- **Comprehensive Exercise Library** - Detailed exercise information with instructions
- **Exercise Categories** - Organized by body areas (Chest, Biceps, Glutes, Cardio, etc.)
- **Exercise Details** - Step-by-step instructions, target muscles, equipment, and difficulty levels
- **Search Functionality** - Find exercises quickly with search and filtering
- **Visual Content** - Support for exercise images and videos

### 👨‍🏫 Coach Features
- **Program Management** - Create and edit workout programs for trainees
- **Trainee Management** - View and manage assigned trainees
- **Smart Dropdowns** - Exercise selection from Firebase database with search
- **Standardized Inputs** - Predefined sets/reps and RPE options for consistency

### 💬 Social Features
- **User Search** - Find and connect with other gym members
- **Chat System** - Real-time messaging between users
- **User Profiles** - View other members' profiles and fitness information

### 📅 Program & Calendar
- **Workout Programs** - Structured weekly workout plans
- **Calendar Integration** - View and track workout schedules
- **Progress Tracking** - Monitor fitness progress over time

### 🏢 Gym Integration
- **Multi-gym Support** - Support for multiple gym locations
- **Gym Selection** - Users choose their primary gym
- **Payment Integration** - Gym membership payment processing

## 🛠️ Tech Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe JavaScript development
- **React Navigation** - Navigation and routing
- **React Native Vector Icons** - Icon library

### Backend & Database
- **Firebase Authentication** - User authentication and management
- **Cloud Firestore** - NoSQL database for real-time data
- **Firebase Functions** - Serverless backend functions
- **Firebase Storage** - File and image storage

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Expo CLI** - Development and build tools

## 📱 App Structure

```
app/
├── Screens/
│   ├── Auth/           # Authentication screens
│   ├── Main/           # Main app screens
│   ├── Onboarding/     # User onboarding
│   └── GymSelection/   # Gym selection flow
├── components/         # Reusable UI components
├── types/             # TypeScript type definitions
└── firebaseConfig.ts  # Firebase configuration

functions/
├── src/
│   └── index.ts       # Firebase Cloud Functions

components/
├── Container.tsx      # Layout container
├── Dropdown.tsx       # Custom dropdown component
├── MainButton.tsx     # Primary button component
└── SearchBar.tsx      # Search input component
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase project setup
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GymMatePlus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Firebase Functions dependencies**
   ```bash
   cd functions
   npm install
   cd ..
   ```

4. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Google provider)
   - Create Firestore database
   - Enable Firebase Functions
   - Download and configure `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

5. **Environment Configuration**
   - Update `firebaseConfig.ts` with your Firebase project credentials
   - Configure Google Sign-In for your platform

6. **Start the development server**
   ```bash
   npx expo start
   ```

### Firebase Setup

1. **Firestore Collections**
   ```
   users/          # User profiles and data
   exercises/      # Exercise database
   conversations/  # Chat conversations
   gyms/          # Gym information
   ```

2. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Deploy Firebase Functions**
   ```bash
   firebase deploy --only functions
   ```

4. **Seed Exercise Data**
   ```bash
   # Call the seedExercises function via HTTP
   curl -X POST https://your-region-your-project.cloudfunctions.net/seedExercises
   ```

## 🔧 Configuration

### Firebase Configuration
Update `app/firebaseConfig.ts` with your Firebase project settings:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Google Sign-In Setup
1. Configure OAuth consent screen in Google Cloud Console
2. Add your app's SHA-1 fingerprint for Android
3. Configure URL schemes for iOS

## 📊 Database Schema

### Users Collection
```typescript
{
  displayName: string;
  email: string;
  photoURL?: string;
  weight: number;
  height: number;
  sex: string;
  dateOfBirth: string;
  fitnessGoals: string[];
  difficulty: string;
  gym: number;
  accountType: 'user' | 'coach' | 'admin';
  program?: WorkoutProgram;
  trainees?: string[]; // For coaches
}
```

### Exercises Collection
```typescript
{
  name: string;
  area: string;
  description: string;
  instructions: string[];
  targetMuscles: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl?: string;
  videoUrl?: string;
}
```

## 🎯 Key Features Implementation

### Exercise System
- **Dynamic Exercise Loading** - Exercises fetched from Firebase
- **Search & Filter** - Real-time search with area filtering
- **Detailed Views** - Comprehensive exercise information
- **Navigation** - Seamless navigation between exercise lists and details

### Coach Program Editor
- **Dropdown Selections** - Smart dropdowns for exercises, sets, and RPE
- **Firebase Integration** - Real-time exercise database access
- **Standardized Inputs** - Consistent program formatting
- **Auto-save** - Automatic program saving and validation

### User Authentication
- **Google OAuth** - Secure authentication flow
- **Profile Management** - Comprehensive user profiles
- **Role-based Access** - Different features for users, coaches, and admins

## 🔒 Security

- **Firestore Security Rules** - Comprehensive database security
- **Authentication Required** - All features require authentication
- **Role-based Permissions** - Different access levels for different user types
- **Data Validation** - Server-side validation for all inputs

## 🚀 Deployment

### Building for Production

1. **Android**
   ```bash
   npx expo build:android
   ```

2. **iOS**
   ```bash
   npx expo build:ios
   ```

3. **Web**
   ```bash
   npx expo build:web
   ```

### Firebase Deployment
```bash
# Deploy all Firebase services
firebase deploy

# Deploy specific services
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** - For the excellent development platform
- **Firebase Team** - For the comprehensive backend services
- **React Native Community** - For the amazing ecosystem
- **Contributors** - For their valuable contributions

## 📞 Support

For support, email beaconace@gmail.com or create an issue in the repository.

---

**GymMate+** - Connecting fitness enthusiasts with professional coaching and comprehensive workout management. 💪
