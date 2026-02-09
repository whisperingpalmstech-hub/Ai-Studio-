# AI Studio 🎨

**Enterprise-Grade AI Image & Video Generation Platform**

A modern, web-based AI Studio platform that democratizes AI-powered image and video generation by providing a production-ready, scalable, and secure alternative to tools like ComfyUI and Automatic1111.

---

## 🚀 Features

### ✅ Phase 1: Foundation (Complete)

- **🔐 Authentication & Authorization**
  - Supabase Auth with email/password
  - OAuth integration (Google, GitHub)
  - Secure session management
  
- **🎨 AI Image Generation**
  - Text-to-image generation
  - Advanced parameter controls (steps, CFG, seed, sampler)
  - Multiple aspect ratios (1:1, 3:4, 4:3, 16:9, 9:16)
  - Real-time progress updates
  
- **💳 Credit System**
  - User credit balance tracking
  - Automatic credit deduction
  - Credit purchase flow (ready for Stripe)
  
- **🖼️ Gallery**
  - View all generated images
  - Search by prompt
  - Download & delete functionality
  - Detailed generation metadata
  
- **📊 Dashboard Pages**
  - Main dashboard with stats
  - Generate page with advanced controls
  - Gallery with grid view
  - Workflows (node-based editor ready)
  - Model management
  - Comprehensive settings

- **🎯 Modern UI/UX**
  - Enterprise-grade dark theme
  - Glassmorphism design
  - Responsive layout
  - Smooth animations
  - Inline styles for reliability

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components
- Lucide Icons
- Framer Motion

**Backend:**
- Supabase (Auth, Database, Storage)
- PostgreSQL (user data, generations)
- Next.js API Routes
- Hugging Face Inference API (AI generation)

**Infrastructure:**
- Monorepo structure (Turborepo)
- pnpm package manager
- ESLint & Prettier

### Project Structure

```
ai-studio/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── (auth)/        # Authentication pages
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/   # Dashboard layout & pages
│   │   │   │   └── dashboard/
│   │   │   │       ├── page.tsx            # Main dashboard
│   │   │   │       ├── generate/           # Image generation
│   │   │   │       ├── gallery/            # User gallery
│   │   │   │       ├── workflows/          # Workflow management
│   │   │   │       ├── models/             # Model library
│   │   │   │       └── settings/           # User settings
│   │   │   ├── api/
│   │   │   │   └── generate/  # Generation API route
│   │   │   ├── globals.css    # Global styles
│   │   │   └── layout.tsx     # Root layout
│   │   ├── components/        # Reusable components
│   │   ├── lib/
│   │   │   └── supabase/      # Supabase clients
│   │   └── public/
│   └── api/                   # Backend API (future)
├── supabase/
│   └── migrations/            # Database schemas
├── .env.local                 # Environment variables
└── README.md
```

---

## 📦 Database Schema

### Tables

**profiles**
```sql
- id (uuid, PK, references auth.users)
- credits (integer, default: 100)
- created_at (timestamp)
- updated_at (timestamp)
```

**generations**
```sql
- id (uuid, PK)
- user_id (uuid, FK -> profiles.id)
- prompt (text)
- negative_prompt (text)
- image_url (text)
- width (integer)
- height (integer)
- steps (integer)
- guidance_scale (float)
- seed (integer)
- status (text: pending|completed|failed)
- created_at (timestamp)
```

**workflows** (future)
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- name (text)
- description (text)
- workflow_json (jsonb)
- created_at (timestamp)
```

---

## ⚙️ Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account
- Hugging Face account (for API token)

### 1. Clone & Install

```bash
git clone <repository-url>
cd ai-studio
pnpm install
```

### 2. Environment Variables

Create `apps/web/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Generation
HUGGINGFACE_API_TOKEN=your_huggingface_token
```

### 3. Database Setup

Run Supabase migrations:

```bash
cd supabase
# Apply migrations to your Supabase project
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

---

## 🔑 Getting API Tokens

### Hugging Face Token (Free)

1. Go to https://huggingface.co/settings/tokens
2. Sign up (free)
3. Click "New token"
4. Select "Read" role
5. Copy token (starts with `hf_...`)
6. Add to `.env.local`

---

## 🎯 Usage Guide

### 1. **Register/Login**
   - Navigate to `/register` or `/login`
   - Sign up with email or OAuth
   - Default: 100 free credits

### 2. **Generate Images**
   - Go to `/dashboard/generate`
   - Enter prompt (e.g., "A majestic dragon in a cyberpunk city")
   - Adjust parameters (optional)
   - Click "Generate Image"
   - Costs: 1 credit per generation

### 3. **View Gallery**
   - Go to `/dashboard/gallery`
   - Browse all your generations
   - Search by prompt
   - Download or delete images

### 4. **Manage Settings**
   - Go to `/dashboard/settings`
   - Update profile
   - View credit balance
   - Manage subscription

---

## 🗺️ Roadmap (Based on SRT Document)

### ✅ Phase 1: Foundation (CURRENT)
- [x] User authentication
- [x] Basic txt2img generation
- [x] Simple web UI
- [x] Credit system
- [x] Gallery
- [ ] Model upload (in progress)

### 📅 Phase 2: Core Features (Next)
- [ ] img2img, inpainting, outpainting
- [ ] LoRA and embedding support
- [ ] ControlNet integration
- [ ] Node-based workflow editor
- [ ] Real-time WebSocket updates
- [ ] Asset management

### 🔮 Phase 3: Advanced Features
- [ ] Video generation (SVD, AnimateDiff)
- [ ] Subscription billing (Stripe)
- [ ] Team workspaces
- [ ] API access for Pro tier
- [ ] Custom node creation

### 🚀 Phase 4: Scale & Polish
- [ ] Multi-region deployment
- [ ] SSO/SAML integration
- [ ] White-label options
- [ ] Marketplace for workflows

---

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev          # Start dev server

# Building
pnpm build        # Build for production
pnpm start        # Start production server

# Linting
pnpm lint         # Run ESLint
```

### Code Style

- TypeScript strict mode
- Inline styles for critical components
- Tailwind for utility classes
- Component-first architecture

---

## 🔐 Security

- Supabase Row Level Security (RLS) policies
- JWT-based authentication
- Environment variable protection
- Input validation on all forms
- CSRF protection

---

## 📊 Current Stats

- **Pages:** 10+ fully functional pages
- **Components:** 20+ reusable components
- **API Routes:** 1 (generation endpoint)
- **Database Tables:** 2 (profiles, generations)
- **Credit System:** Fully functional
- **Authentication:** Complete with OAuth

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🆘 Support

For issues or questions:
- Create an issue on GitHub
- Check the SRT document for architecture details
- Review Supabase documentation

---

## 🎉 Acknowledgments

- Built with Next.js, React, and TypeScript
- Powered by Supabase and Hugging Face
- Inspired by ComfyUI and Automatic1111
- UI components from Radix UI

---

**Built with ❤️ for the AI community**
