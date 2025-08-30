# 🦷 Dental Appointment System

A comprehensive MERN stack application for managing dental appointments with separate portals for patients and administrators.

## 🚀 Features

### 👥 Patient Portal
- **User Registration & Authentication**: Secure registration with complete profile information
- **Dashboard**: Personal dashboard with appointment history and profile management
- **Appointment Booking**: Easy-to-use booking system with service selection, doctor choice, and time slots
- **Profile Management**: Update personal information and view appointment history

### 👨‍⚕️ Admin Portal
- **Patient Management**: View, edit, and manage all registered patients
- **Appointment Management**: Full CRUD operations for appointments with status tracking
- **Doctor Management**: Manage doctor profiles, specialties, and availability
- **Payment Tracking**: Monitor payments, billing, and financial records
- **Reports & Analytics**: Generate business reports and view system analytics
- **System Settings**: Configure clinic information, operating hours, and preferences

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **React Router**: Client-side routing for SPA navigation

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework with clustering support
- **MongoDB**: NoSQL database for data storage
- **Socket.IO**: Real-time communication capabilities
- **Winston**: Advanced logging system

### Development Tools
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS post-processing
- **Git**: Version control

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/ayush708/dental-appointment-system.git
cd dental-appointment-system
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install
npm start
\`\`\`
The backend will run on http://localhost:5000

### 3. Frontend Setup
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
The frontend will run on http://localhost:3000

## 🔐 Demo Credentials

### Admin Login
- **Email**: admin@dentalcare.com
- **Password**: admin123

### Patient Registration
Register through the user portal at `/user/register`

## 🎯 Usage

### For Patients
1. **Register**: Create a new account at `/user/register`
2. **Login**: Access your dashboard at `/user/login`
3. **Book Appointment**: Schedule appointments at `/user/book-appointment`
4. **Manage Profile**: View and update your information in the dashboard

### For Administrators
1. **Login**: Access admin portal at `/admin/login`
2. **Manage Patients**: View and manage all registered patients
3. **Handle Appointments**: Confirm, reschedule, or cancel appointments
4. **Monitor System**: View reports, analytics, and system settings

## 📱 URL Structure

### Public Routes
- `/` - Homepage with portal selection
- `/about` - About page
- `/services` - Services information
- `/contact` - Contact information

### User/Patient Routes
- `/user/register` - Patient registration
- `/user/login` - Patient login
- `/user/dashboard` - Patient dashboard
- `/user/book-appointment` - Appointment booking

### Admin Routes
- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/patients` - Patient management
- `/admin/appointments` - Appointment management
- `/admin/doctors` - Doctor management
- `/admin/payments` - Payment tracking
- `/admin/reports` - Reports and analytics
- `/admin/settings` - System settings

## 🗂️ Project Structure

\`\`\`
dental-appointment-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── config/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── contexts/
│   │   └── main.jsx
│   └── package.json
└── README.md
\`\`\`

## 🔄 Data Flow

1. **User Registration** → **Admin Patient Management**
2. **Appointment Booking** → **Admin Appointment Management**
3. **Real-time Updates** → **Live Dashboard Statistics**

## 🚀 Deployment

### Frontend Deployment
\`\`\`bash
cd frontend
npm run build
\`\`\`

### Backend Deployment
\`\`\`bash
cd backend
npm start
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ayush** - [GitHub Profile](https://github.com/ayush708)

## 🙏 Acknowledgments

- Modern UI design with TailwindCSS
- Comprehensive MERN stack implementation
- Real-time data management
- Professional admin portal functionality

---

⭐ **Star this repository if you found it helpful!**
