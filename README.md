# 🐾 PetCare+

A full-stack **Veterinary Telemedicine & Pet Management Platform** built with Flutter (Web) and Node.js. PetCare+ connects pet owners with professional veterinarians through real-time chat and video consultations.

---

## ✨ Features

### 👤 For Pet Owners (Clients)
- 📋 Register & manage multiple pets (species, breed, age, health records)
- 📅 Book appointments with available veterinary doctors
- 💬 Real-time chat with assigned doctors via WebSocket
- 📹 Video consultations powered by Agora RTC
- 🛒 Browse the pet marketplace
- 🤖 AI-powered pet health assistant

### 🩺 For Veterinary Doctors
- 📋 View and manage incoming appointment requests
- ✅ Accept / reject / complete appointments
- 💬 Real-time chat with pet owners
- 📹 Start and receive video calls
- 📊 Manage availability and specialization profile

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Client / Doctor / Admin)
- Agora RTC token-based secure video calling

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Flutter (Web) |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL (via Sequelize ORM) |
| **Real-time** | Socket.IO (chat & call signaling) |
| **Video Calls** | Agora RTC Engine |
| **Auth** | JSON Web Tokens (JWT) |
| **File Storage** | Local uploads (Multer) |
| **Email** | Nodemailer (Gmail SMTP) |

---

## 📁 Project Structure

```
PetCare/
├── Petcare/                    # Flutter Web App
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── dashboard/      # Client & Doctor dashboards
│   │   │   ├── appointment/    # Booking & management
│   │   │   ├── chat/           # Chat & video call screens
│   │   │   ├── marketplace/    # Pet marketplace
│   │   │   └── services/       # API & socket services
│   │   └── utils/              # Colors, helpers
│   ├── web/
│   │   └── index.html          # Agora Web SDK included here
│   └── pubspec.yaml
│
└── server/
    └── server/                 # Node.js Backend
        ├── server.js           # Main server + Socket.IO
        ├── routes/
        │   ├── authRoutes.js
        │   ├── petRoutes.js
        │   ├── appointmentRoutes.js
        │   ├── chatRoutes.js
        │   ├── agoraRoutes.js  # Token generation
        │   ├── marketplaceRoutes.js
        │   └── aiRoutes.js
        ├── controllers/
        ├── models/             # Sequelize models
        ├── middleware/         # JWT auth middleware
        ├── config/
        │   └── database.js
        └── uploads/            # Uploaded images
```

---

## 🚀 Getting Started

### Prerequisites
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (stable channel)
- [Node.js](https://nodejs.org/) v18+
- [XAMPP](https://www.apachefriends.org/) or MySQL server running on port `3307`

---

### 1. Backend Setup

```bash
cd server/server
npm install
```

Create a `.env` file in `server/server/`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=petvet1
JWT_SECRET=your_super_secret_jwt_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
```

Start the backend:

```bash
node server.js
```

The server will run at `http://localhost:5000`.

---

### 2. Flutter Web Setup

```bash
cd Petcare
flutter pub get
flutter run -d chrome
```

Or build for production:

```bash
flutter build web --release
npx http-server build/web -p 50174 --cors -c-1
```

The app will be available at `http://localhost:50174`.

---

### 3. Video Calls on Mobile (HTTPS Required)

Mobile browsers block camera/microphone access on HTTP. Use [ngrok](https://ngrok.com/) to create a secure HTTPS tunnel for local testing:

```bash
ngrok http 50174
```

Open the generated `https://` URL on your phone.

---

## 🔑 Agora Video Setup

1. Create a project at [console.agora.io](https://console.agora.io/)
2. Copy your **App ID** and **App Certificate**
3. Add them to the `.env` file (see above)
4. The backend will automatically generate short-lived RTC tokens at:
   ```
   POST /api/agora/token
   Body: { "channelName": "appt_53", "uid": 55 }
   ```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/pets` | Get all pets (client) |
| POST | `/api/pets` | Add a new pet |
| GET | `/api/appointments` | Get appointments |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/chat/:appointmentId` | Get chat messages |
| POST | `/api/agora/token` | Generate Agora RTC token |
| GET | `/api/marketplace` | Get marketplace listings |

---

## 🔌 Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_room` | Client → Server | Join appointment chat room |
| `send_message` | Client → Server | Send a chat message |
| `receive_message` | Server → Client | Receive a new message |
| `call_user` | Client → Server | Initiate a video call |
| `incoming_call` | Server → Client | Notify of incoming call |
| `end_call` | Client → Server | End the video call |
| `call_ended` | Server → Client | Notify call has ended |

---

## 📸 Screenshots

> _Add screenshots here_

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

This project is for academic/educational purposes.
