# infinity Creations

**AI-Powered Design & Branding Platform**

A modern web application for creating, designing, and managing creative projects with integrated AI assistance. Built with React, TypeScript, and powered by Google's Gemini AI API.

🌐 **Live Demo:** [maridadi-creations.vercel.app](https://maridadi-creations.vercel.app)

---

## 📋 Overview

Maridadi Creations is a full-featured creative platform that combines:
- **Modern Design Tools** - Intuitive interface for creative professionals
- **AI Integration** - Powered by Google Gemini API for intelligent suggestions and assistance
- **Backend Services** - Express.js server with real-time API handling
- **Database** - Firebase Firestore for secure data storage and management
- **Authentication** - Firebase authentication system
- **SEO Optimized** - Production-ready with comprehensive SEO implementation
- **Responsive Design** - Mobile-first approach with Tailwind CSS

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/apikey))
- **Firebase Account** (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zxds1/maridadi-creations.git
   cd maridadi-creations
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your credentials:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

---

## 📦 Available Scripts

- **`npm run dev`** - Start development server with Vite (port 3000)
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build locally
- **`npm run api`** - Start the backend Gemini API server
- **`npm run clean`** - Remove build artifacts
- **`npm run lint`** - Run TypeScript type checking

---

## 🏗️ Architecture

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling with typography plugin
- **React Router** - Client-side routing
- **Motion** - Smooth animations
- **Lucide React** - Icon library

### Backend
- **Express.js** - API server
- **Google GenAI SDK** - Gemini AI integration
- **Dotenv** - Environment configuration

### Services
- **Firebase** - Authentication, Firestore database
- **Firebase Admin SDK** - Server-side Firebase operations
- **Firebase Rules** - Firestore security rules

### UI Components & Utilities
- **React Hot Toast** - Toast notifications
- **React Markdown** - Markdown rendering
- **React Easy Crop** - Image cropping utility
- **React Helmet Async** - Document head management
- **Autoprefixer** - CSS vendor prefixes

---

## 🔧 Configuration Files

- **`vite.config.ts`** - Vite configuration with React plugin
- **`tsconfig.json`** - TypeScript compiler options
- **`tailwind.config.ts`** - Tailwind CSS customization (implicit, uses @tailwindcss/vite)
- **`firebase.json`** - Firebase configuration
- **`firestore.rules`** - Firestore security rules
- **`vercel.json`** - Vercel deployment configuration

---

## 📚 Documentation

The project includes detailed documentation for:

- **[SEO Implementation](./SEO_IMPLEMENTATION.md)** - SEO strategies and meta tags
- **[Keyword Strategy](./KEYWORD_STRATEGY.md)** - Content and keyword optimization

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | ✅ Yes |
| `APP_URL` | Application URL for self-referential links and OAuth callbacks | ✅ Yes |

---

## 🚀 Deployment

### Vercel (Recommended)

This project is configured for Vercel deployment:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy with `vercel deploy`

The application is already deployed at: [maridadi-creations.vercel.app](https://maridadi-creations.vercel.app)

### Firebase Deployment

Backend API can be deployed to Firebase Cloud Run using:
```bash
npm run api
```

---

## 📁 Project Structure

```
.
├── src/                    # React components and application code
├── server/                 # Express.js backend and Gemini API integration
├── public/                 # Static assets (icons, manifest, etc.)
├── firestore.rules         # Firebase security rules
├── firebase-*.json         # Firebase configuration files
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── index.html             # HTML entry point
```

---

## 🔒 Firebase Security

Firestore security rules are configured in `firestore.rules` to ensure:
- Proper authentication validation
- Data-level access control
- Collection-specific permissions

---

## 💡 Features

✨ **Design & Creativity Tools** - Professional-grade design interface

🤖 **AI-Powered Assistance** - Gemini AI integration for smart suggestions

📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

🔐 **Secure Authentication** - Firebase authentication system

💾 **Cloud Storage** - Firestore database for reliable data persistence

🌍 **Global CDN** - Vercel edge network for fast content delivery

♿ **Accessibility** - WCAG compliant with proper semantic HTML

📊 **SEO Optimized** - Complete SEO implementation for search visibility

---

## 🛠️ Development

### Type Checking

Ensure code quality with TypeScript:
```bash
npm run lint
```

### Code Style

This project uses:
- **TypeScript** for type safety
- **Tailwind CSS** for consistent styling
- **React best practices** for component design

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

## 📞 Support

For issues, questions, or suggestions, please visit the [GitHub Issues](https://github.com/zxds1/maridadi-creations/issues) page.

---

## 🔗 Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Gemini API](https://ai.google.dev)
- [Vercel Documentation](https://vercel.com/docs)

---

**Made with ❤️ by Maridadi Creations**
