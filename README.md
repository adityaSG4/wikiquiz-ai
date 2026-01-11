# 🧠 WikiQuiz AI

A full-stack web application that transforms Wikipedia articles into interactive quizzes using Google Gemini AI.

## 🏗️ Architecture

### **Tech Stack**
- **Backend**: Python 3.10+, Flask, SQLAlchemy, PostgreSQL
- **Frontend**: React 19, Vite, Vanilla CSS
- **AI**: LangChain + Google Gemini (gemini-2.5-flash-lite)
- **Database**: PostgreSQL (Neon Tech for cloud)
- **Authentication**: JWT with secure cookies

### **Project Structure**
```
ass2/
├── backend/                    # Python Flask API
│   ├── app.py               # Flask application entry point
│   ├── config.py            # Configuration & environment variables
│   ├── database.py          # Database connection & initialization
│   ├── models.py            # SQLAlchemy data models
│   ├── routes/              # API endpoints
│   │   ├── auth.py         # Authentication routes
│   │   └── main.py         # Quiz generation & management
│   ├── services/            # Business logic
│   │   ├── scraper.py       # Wikipedia content extraction
│   │   └── ai_generator.py  # AI quiz generation
│   ├── migrations/          # Database schema migrations
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example        # Environment template
│   └── venv/               # Python virtual environment
├── frontend/                  # React Vite application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── QuizModal.jsx
│   │   │   ├── Statistics.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── LogoutModal.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── NotFound.jsx
│   │   ├── context/         # React context
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useDebounce.js
│   │   │   └── useMobile.js
│   │   ├── services/        # API client
│   │   │   └── api.js
│   │   ├── App.jsx          # Main React component
│   │   ├── main.jsx         # React entry point
│   │   ├── index.css        # Global styles
│   │   └── App.css         # App-specific styles
│   ├── public/              # Static assets
│   ├── package.json         # Dependencies & scripts
│   ├── vite.config.js      # Vite configuration
│   └── .env               # Environment variables
├── .gitignore              # Git ignore rules
└── README.md              # This file
```

## 🚀 Quick Start

### **Prerequisites**
- Python 3.10+ with pip
- Node.js 18+ with npm
- PostgreSQL database (or Neon for cloud)
- Google AI Studio API key

### **1. Clone Repository**
```bash
git clone https://github.com/adityaSG4/wikiquiz-ai.git
cd wikiquiz-ai
```

### **2. Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env with your API keys and database URL

# Run migrations
flask db upgrade

# Start development server
python app.py
```
**Backend runs at**: `http://localhost:5000`

### **3. Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_BACKEND_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```
**Frontend runs at**: `http://localhost:5173`

## 🔧 Environment Configuration

### **Backend (.env)**
```env
# Database (Neon PostgreSQL recommended)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Google AI API (get from AI Studio)
GOOGLE_API_KEY=AIzaSy...your-api-key

# JWT Secret (generate secure random string)
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-chars

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Environment
FLASK_ENV=development
```

### **Frontend (.env)**
```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:5000/api
```


## 🎨 Features

### **Core Functionality**
- ✅ **AI Quiz Generation**: Transform Wikipedia articles into interactive quizzes
- ✅ **Smart Content Extraction**: Advanced paragraph and topic identification
- ✅ **User Authentication**: Secure JWT-based auth with cookies
- ✅ **Quiz Management**: Create, view, and manage quizzes
- ✅ **Progress Tracking**: Detailed statistics and history
- ✅ **Responsive Design**: Mobile-first sharp design system

### **UI/UX Features**
- ✅ **Modern Interface**: Clean, sharp black/white design
- ✅ **Mobile Responsive**: Optimized for all screen sizes
- ✅ **Interactive Quizzes**: Real-time feedback and scoring
- ✅ **User Profiles**: Personalized experience
- ✅ **Error Handling**: 404 pages and validation
- ✅ **Accessibility**: Semantic HTML and ARIA support

### **Security Features**
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **CORS Protection**: Proper cross-origin handling
- ✅ **Input Validation**: Sanitized user inputs
- ✅ **SQL Injection Prevention**: SQLAlchemy ORM protection
- ✅ **Environment Security**: Proper secret management

## 📦 Build & Deploy

### **Frontend Build**
```bash
cd frontend
npm run build
```
Creates `dist/` folder with optimized static files.

### **Backend Production**
```bash
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### **Deployment Options**

#### **Render.com (Recommended)**
- **Backend**: Web Service with `backend/` as root
- **Frontend**: Static Site with `frontend/` as root
- **Environment**: Add all `.env` variables to platform

#### **Traditional VPS**
- **Backend**: Gunicorn + Nginx reverse proxy
- **Frontend**: Nginx static file serving
- **Database**: PostgreSQL with connection pooling

## 🧪 Development Commands

### **Backend**
```bash
# Database operations
flask db upgrade              # Apply migrations
flask db migrate -m "message" # Create migration
flask db stamp head          # Reset migrations

# Development server
python app.py               # Start Flask dev server
```

### **Frontend**
```bash
# Development
npm run dev                # Start Vite dev server
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # Run ESLint
```

## 🔒 Security Notes

### **Production Checklist**
- [ ] Set `FLASK_ENV=production`
- [ ] Use strong `JWT_SECRET_KEY` (32+ chars)
- [ ] Update CORS origins for production domain
- [ ] Enable HTTPS for secure cookies
- [ ] Set up database connection pooling
- [ ] Configure rate limiting

### **API Security**
- JWT tokens with secure, httpOnly cookies
- CORS with credentials support
- Input validation and sanitization
- SQL injection prevention via ORM
- Rate limiting on API endpoints

## 🐛 Troubleshooting

| Issue | Solution |
|--------|----------|
| CORS errors | Check `origins` in CORS() matches frontend URL |
| 401 Unauthorized | Verify cookies are being sent (`withCredentials: true`) |
| DB connection failed | Check `DATABASE_URL` includes `?sslmode=require` |
| API key quota | Add more keys to `GOOGLE_API_KEYS` |
| Build fails | Check Node.js version (18+) and clear cache |

## 🎯 Performance Optimizations

### **Frontend**
- Code splitting with React.lazy()
- Image optimization and lazy loading
- Debounced search inputs
- Responsive images and assets
- Minified CSS and JS in production

### **Backend**
- Database connection pooling
- Redis caching for API responses
- Optimized SQL queries with indexes
- Rate limiting to prevent abuse
- Efficient pagination for large datasets

## 📱 Mobile Features

- Responsive design with CSS Grid/Flexbox
- Touch-friendly interface elements
- Optimized fonts and spacing
- Swipe gestures for quiz navigation
- Progressive Web App capabilities

## 🔮 Future Enhancements

- [ ] Multi-language support
- [ ] Quiz categories and tags
- [ ] Social sharing features
- [ ] Advanced analytics dashboard
- [ ] Offline quiz support
- [ ] Collaborative quiz creation
- [ ] AI-powered difficulty adjustment
- [ ] Voice quiz interface

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation

---

**🎉 Happy Quiz Making! Transform knowledge into interactive learning experiences.**