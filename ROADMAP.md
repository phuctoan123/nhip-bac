# ROADMAP & KIẾN TRÚC MỞ RỘNG - Nhíp Bạc

**Version:** 1.0  
**Last Updated:** May 29, 2026  
**Owner:** Development Team

---

## 1. Tổng quan hiện tại (Current State)

### Mô tả Website Hiện Tại
**Nhíp Bạc** là một website tĩnh (static) được xây dựng bằng:
- **HTML5** (semantic structure, multi-page)
- **CSS3** (custom properties, responsive design, glassmorphism effects)
- **Vanilla JavaScript ES6** (no framework)
- **Font Awesome 6.5.2** cho icons
- **No backend, no database**

Website hiện có **6 trang chính** (Home, Services, Pricing, About, Reviews, Contact) + mobile responsive design + multi-language support (VI/EN).

### Điểm mạnh hiện tại ✅
- 🚀 **Fast loading** - No framework overhead
- 📱 **Fully responsive** - Mobile/Tablet/Desktop optimized
- 🎨 **Beautiful UI** - Premium glassmorphism, smooth animations
- 🌍 **Multi-language** - VI/EN support with localStorage
- 📱 **Pure vanilla JS** - No dependencies, easy to understand
- ♿ **Accessible** - Semantic HTML, aria labels, WCAG compliant
- 💾 **Lightweight** - All files easy to manage, pure static files

### Hạn chế lớn nhất khi scale ⚠️
| Hạn chế | Impact | Severity |
|---|---|---|
| **No backend** | Can't process form submissions, no data persistence | 🔴 High |
| **No database** | Can't store bookings, customer info, reviews | 🔴 High |
| **No CMS** | Content updates require manual file editing | 🟠 Medium |
| **Single CSS/JS file** | Hard to maintain as codebase grows | 🟠 Medium |
| **No authentication** | Can't manage user accounts, admin panel | 🔴 High |
| **No analytics** | Can't track user behavior, conversions | 🟠 Medium |
| **Manual deployment** | No CI/CD pipeline, risky updates | 🟠 Medium |
| **No testing** | No automated tests, quality assurance gaps | 🟠 Medium |
| **No API** | Can't integrate with external services | 🟠 Medium |

---

## 2. Mục tiêu mở rộng (Business Goals)

### 🎯 Mục tiêu 6 tháng tới

**Q3 2026 (Jun - Aug)**
- ✅ Setup backend infrastructure
- ✅ Implement online booking system
- ✅ Add customer dashboard
- ✅ Integrate payment gateway
- ✅ Setup analytics & conversion tracking

**Expected Metrics:**
- 50% increase in online bookings
- 3000+ monthly website visitors
- 30% booking conversion rate

### 🎯 Mục tiêu 12–24 tháng tới

**Q4 2026 - Q1 2027**
- ✅ Launch CMS for content management
- ✅ Mobile app (iOS/Android) or PWA
- ✅ AI-powered chatbot for customer support
- ✅ Loyalty program / Membership system
- ✅ Salon management dashboard for staff

**Q2-Q3 2027**
- ✅ Multi-location support (scale to other salons)
- ✅ Advanced analytics & business intelligence
- ✅ Integration with external services (email, SMS, Zalo API)
- ✅ Recommendation engine (personalized suggestions)
- ✅ Video content management (tutorials, testimonials)

**Expected Metrics:**
- 10,000+ monthly visitors
- 60% of bookings online
- 80% customer retention rate
- Multi-location capability

### 📋 Tính năng dự kiến cần thêm

| Tính năng | Mức độ Ưu tiên | Timeline |
|---|---|---|
| **Online Booking System** | 🔴 Critical | Phase 1 (1-4 weeks) |
| **Payment Integration** | 🔴 Critical | Phase 1 (1-4 weeks) |
| **Customer Login** | 🔴 Critical | Phase 2 (4-8 weeks) |
| **Admin Dashboard** | 🔴 Critical | Phase 2 (4-8 weeks) |
| **Email/SMS Notifications** | 🟠 High | Phase 1 (1-4 weeks) |
| **Analytics & Reporting** | 🟠 High | Phase 1 (1-4 weeks) |
| **CMS for Pages** | 🟠 High | Phase 3 (2-4 months) |
| **AI Chatbot** | 🟡 Medium | Phase 3 (2-4 months) |
| **PWA / Mobile App** | 🟡 Medium | Phase 3 (2-4 months) |
| **Loyalty Program** | 🟡 Medium | Phase 4 (after 6 months) |
| **Multi-location Support** | 🟡 Medium | Phase 4 (after 6 months) |
| **Video Management** | 🟡 Medium | Phase 4 (after 6 months) |

---

## 3. Kiến trúc đề xuất (Recommended Architecture)

### Kiến trúc hiện tại
```
┌─────────────────────────────────┐
│  Static HTML/CSS/JS (Frontend)  │
├─────────────────────────────────┤
│  No Backend, No Database        │
│  Form → Zalo Manual             │
└─────────────────────────────────┘

Limitation: Static only, no dynamic data
```

### Kiến trúc mục tiêu (Target Architecture - Full Stack)

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
│  (React/Vue/Next.js - Modern SPA/SSR)                        │
├──────────────────────────────────────────────────────────────┤
│                    API Gateway                               │
│  (REST or GraphQL)                                           │
├──────────────────────────────────────────────────────────────┤
│                    Backend Layer                             │
│  (Node.js/Express, Python/Django, Java/Spring)              │
├──────────────────────────────────────────────────────────────┤
│                    Services Layer                            │
│  - Auth Service        - Booking Service                     │
│  - Payment Service     - Notification Service                │
│  - Analytics Service   - CMS Service                         │
├──────────────────────────────────────────────────────────────┤
│                    Database Layer                            │
│  - PostgreSQL (relational) - MongoDB (documents)             │
│  - Redis (cache)           - Elasticsearch (search)          │
├──────────────────────────────────────────────────────────────┤
│                    External Services                         │
│  - Stripe/PayPal (payment) - SendGrid (email)                │
│  - Zalo API (messaging)    - Google Analytics                │
│  - AWS S3 (media storage)  - Auth0 (authentication)          │
└──────────────────────────────────────────────────────────────┘
```

### Lý do chọn công nghệ & So sánh

#### Frontend Framework Options

| Framework | Pros | Cons | Recommendation |
|---|---|---|---|
| **Next.js 14** | SSR/SSG, Full-stack, Great DX, File-based routing | Some overkill for simple site | ✅ **BEST CHOICE** |
| **Astro** | Fast, Static-first, Islands architecture | Smaller ecosystem | Good alternative |
| **Vue 3 + Vite** | Lightweight, Easy learning, Reactive | Less ecosystem than React | Good for team preference |
| **React 19** | Large ecosystem, Great community | Complex setup | Good, need Vite/Next |
| **SvelteKit** | Minimal bundle, Great DX | Smaller community | Good alternative |

**Recommendation:** **Next.js 14** because:
- ✅ Supports both SSR (server-side) and static generation
- ✅ Built-in API routes (can skip separate backend initially)
- ✅ Excellent for SEO (important for salon business)
- ✅ Great performance with built-in optimization
- ✅ Easy to scale to full backend later

#### Backend Options (if separate backend needed)

| Backend | Pros | Cons | Cost | Recommendation |
|---|---|---|---|---|
| **Node.js/Express** | JS full-stack, Fast to develop, Large ecosystem | May need microservices for scale | Free/cheap hosting | ✅ **EASIEST** |
| **Python/Django** | Batteries-included, Great ORM, Security | Slower than Node | Free/cheap hosting | Good alternative |
| **Python/FastAPI** | Modern, Fast, Great DX | Newer, smaller ecosystem | Free/cheap hosting | Good alternative |
| **Java/Spring** | Enterprise-grade, Scalable, Performant | Verbose, steep learning curve | $200+/month | For large scale |
| **Go** | Very fast, Concurrent, Cloud-native | Different paradigm | Free/cheap hosting | For high scale |

**Recommendation:** **Node.js/Express** (with TypeScript) because:
- ✅ Same language as frontend (JS/TS)
- ✅ Fast to develop
- ✅ Large ecosystem (libraries for everything)
- ✅ Cheap hosting options (Render, Railway, Heroku)

#### Database Options

| Database | Type | Pros | Cons | Cost | Recommendation |
|---|---|---|---|---|---|
| **PostgreSQL** | Relational | ACID, Scalable, Mature | More complex queries | Free/cheap | ✅ **PRIMARY** |
| **MongoDB** | Document | Flexible schema, Easy scaling | No transactions, overkill for salon | Free | Not needed |
| **Firebase** | Cloud Database | No ops, Real-time, Quick setup | Vendor lock-in, Higher cost | $25-200/month | Option for quick launch |
| **Supabase** | PostgreSQL + API | Open-source Firebase alternative | Smaller ecosystem | Free/cheap | Good alternative |

**Recommendation:** **PostgreSQL** because:
- ✅ Perfect for structured booking/user data
- ✅ ACID guarantees for payments
- ✅ Mature, stable, widely used
- ✅ Free hosting options available

#### Hosting Options

| Host | Type | Pros | Cons | Cost | Recommendation |
|---|---|---|---|---|---|
| **Vercel** | Serverless | Next.js optimized, Free tier, Easy deploy | Limited backend on free tier | Free-$99/month | ✅ **FOR NEXT.JS** |
| **Railway** | Cloud | Great DX, Simple pricing, Good free tier | Less mature than competitors | Free-$20+/month | ✅ **FOR FULL STACK** |
| **Render** | Cloud | Fast, Good UI, PostgreSQL included | Cold starts on free tier | Free-$7+/month | ✅ **GREAT VALUE** |
| **AWS** | Cloud | Unlimited scale, Enterprise features | Complex setup, Steep learning | $20-500+/month | For large scale |
| **Heroku** | Platform | Easy deploy, PostgreSQL included | Expensive, Ending free tier | $50+/month | Not recommended |

**Recommendation:** **Vercel + Railway Stack** because:
- Vercel for Next.js frontend (optimized)
- Railway for backend API + PostgreSQL (great value)

---

## 4. Roadmap Phát triển (Development Roadmap)

### 🔵 Phase 1: Cải thiện nền tảng (1–4 tuần)

**Mục tiêu:** Add basic backend, booking system, payment integration  
**Scope:** Minimal changes to existing frontend, focus on backend

#### Công việc cụ thể
1. ✅ Setup Node.js/Express backend with TypeScript
2. ✅ Setup PostgreSQL database (free tier)
3. ✅ Create REST API endpoints:
   - `POST /api/bookings` - Create booking
   - `GET /api/bookings/:id` - Get booking details
   - `GET /api/availability` - Get available time slots
4. ✅ Implement Stripe/VNPay payment integration
5. ✅ Add email notifications (SendGrid)
6. ✅ Setup admin panel (basic CRUD for bookings)
7. ✅ Implement authentication (JWT)

#### Công nghệ / Tool đề xuất
- **Backend:** Node.js 20 + Express + TypeScript
- **Database:** PostgreSQL (free on Railway)
- **Payment:** Stripe or VNPay SDK
- **Email:** SendGrid or Nodemailer
- **Hosting:** Railway (backend + DB)

#### Thời gian ước tính
- Setup & Database: 3-5 days
- API Development: 5-7 days
- Payment Integration: 3-5 days
- Testing & Deployment: 3-5 days
- **Total: 2-3 weeks**

#### Rủi ro & Phụ thuộc
- ⚠️ **Risk:** Payment integration complexity (PCI compliance)
- ⚠️ **Risk:** Database migration from static to dynamic
- 📌 **Dependency:** Stripe/VNPay account setup
- 📌 **Dependency:** Email service provider account

#### Deliverables
- ✅ Working booking API
- ✅ Payment processing backend
- ✅ Basic admin panel
- ✅ Email notification system
- ✅ Deployment on Railway

---

### 🟡 Phase 2: Chuyển sang Modern Framework (4–8 tuần)

**Mục tiêu:** Migrate frontend from static HTML to Next.js  
**Scope:** Rewrite frontend, improve UX, add customer features

#### Công việc cụ thể
1. ✅ Setup Next.js 14 project with TypeScript
2. ✅ Migrate existing pages to Next.js structure
3. ✅ Create reusable React components from existing HTML
4. ✅ Implement API integration (fetch bookings, availability)
5. ✅ Add customer login/registration
6. ✅ Build customer dashboard (view bookings, cancel, reschedule)
7. ✅ Optimize images & performance (Core Web Vitals)
8. ✅ Setup CI/CD pipeline (GitHub Actions)

#### Công nghệ / Tool đề xuất
- **Frontend:** Next.js 14 + React 19 + TypeScript
- **State Management:** Zustand (lightweight) or TanStack Query
- **UI Components:** Shadcn/ui or Headless UI
- **Styling:** Tailwind CSS (replaces custom CSS)
- **Deployment:** Vercel (optimized for Next.js)

#### Thời gian ước tính
- Setup Next.js: 2-3 days
- Component Migration: 7-10 days
- Customer Features: 7-10 days
- Optimization & Testing: 5-7 days
- **Total: 3-4 weeks**

#### Rủi ro & Phụ thuộc
- ⚠️ **Risk:** Breaking existing functionality during migration
- ⚠️ **Risk:** Learning curve for team (new framework)
- 📌 **Dependency:** Team familiarity with React/Next.js
- 📌 **Dependency:** Existing backend API stable

#### Deliverables
- ✅ Next.js frontend replacing old HTML
- ✅ Customer login & dashboard
- ✅ Responsive component library
- ✅ CI/CD pipeline setup
- ✅ Improved Core Web Vitals scores

---

### 🟠 Phase 3: Thêm tính năng động & CMS (2–4 tháng)

**Mục tiêu:** Add advanced features, CMS for content management  
**Scope:** Full-featured salon management system

#### Công việc cụ thể
1. ✅ Setup Headless CMS (Strapi or Contentful)
2. ✅ Migrate content to CMS (services, pricing, reviews)
3. ✅ Build AI chatbot (OpenAI API)
4. ✅ Implement booking confirmation (SMS + Email)
5. ✅ Create staff management dashboard
6. ✅ Add loyalty/rewards program
7. ✅ Setup analytics (Google Analytics 4, custom events)
8. ✅ Implement Zalo Bot integration
9. ✅ Build reporting & business intelligence dashboard

#### Công nghệ / Tool đề xuất
- **CMS:** Strapi (open-source, self-hosted) or Contentful (SaaS)
- **AI:** OpenAI API for chatbot
- **Realtime:** Socket.io for live notifications
- **Analytics:** PostHog or Mixpanel for custom events
- **Task Queue:** Bull (Redis-based) for async jobs

#### Thời gian ước tính
- CMS Setup: 2 weeks
- Content Migration: 1 week
- Chatbot: 2 weeks
- Staff Dashboard: 2-3 weeks
- Analytics & Reporting: 2 weeks
- Testing & Refinement: 1-2 weeks
- **Total: 2-3 months**

#### Rủi ro & Phụ thuộc
- ⚠️ **Risk:** CMS complexity for non-technical staff
- ⚠️ **Risk:** AI chatbot quality & training
- 📌 **Dependency:** Zalo API documentation
- 📌 **Dependency:** OpenAI API key & quota

#### Deliverables
- ✅ Fully functional CMS
- ✅ AI chatbot for customer support
- ✅ Staff management system
- ✅ Loyalty program
- ✅ Advanced analytics dashboard

---

### 🔴 Phase 4: Scale & Tối ưu (sau 6 tháng)

**Mục tiêu:** Scale to multi-location, mobile app, enterprise features  
**Scope:** Enterprise-grade salon management platform

#### Công việc cụ thể
1. ✅ Multi-location support (different salons)
2. ✅ Mobile app (React Native or Flutter)
3. ✅ Advanced scheduling (AI-powered)
4. ✅ Inventory management (products, supplies)
5. ✅ Staff performance tracking
6. ✅ Financial reporting & accounting
7. ✅ Marketing automation (email campaigns, SMS)
8. ✅ Microservices architecture (if needed)
9. ✅ CDN optimization & caching strategy

#### Công nghệ / Tool đề xuất
- **Mobile:** React Native or Flutter
- **Messaging Queue:** RabbitMQ or Kafka
- **Microservices:** Docker + Kubernetes
- **API Gateway:** Kong or AWS API Gateway
- **CDN:** Cloudflare or AWS CloudFront

#### Thời gian ước tính
- Architecture refactoring: 2-4 weeks
- Mobile app MVP: 2-3 months
- Multi-location: 1-2 months
- Advanced features: 1-2 months
- **Total: 4-6 months**

#### Rủi ro & Phụ thuộc
- ⚠️ **Risk:** Microservices complexity
- ⚠️ **Risk:** Mobile app maintenance overhead
- 📌 **Dependency:** Larger development team
- 📌 **Dependency:** Infrastructure expertise

#### Deliverables
- ✅ Multi-location support
- ✅ iOS/Android mobile apps
- ✅ Enterprise-grade features
- ✅ Scalable microservices architecture

---

## 5. Cấu trúc Code đề xuất cho tương lai

### Folder Structure (Next.js Project)

```
nhip-bac/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (public)/
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── services/
│   │   │   ├── pricing/
│   │   │   ├── about/
│   │   │   └── contact/
│   │   ├── (dashboard)/
│   │   │   ├── bookings/             # Customer bookings
│   │   │   ├── profile/
│   │   │   └── loyalty/
│   │   ├── admin/                    # Admin panel
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── services/
│   │   │   ├── bookings/
│   │   │   └── analytics/
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   ├── bookings/
│   │   │   ├── users/
│   │   │   ├── payments/
│   │   │   └── analytics/
│   │   └── layout.tsx
│   │
│   ├── components/                   # Reusable components
│   │   ├── common/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── SocialDock.tsx
│   │   ├── forms/
│   │   │   ├── BookingForm.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── ContactForm.tsx
│   │   ├── booking/
│   │   │   ├── BookingCard.tsx
│   │   │   ├── TimeSlotPicker.tsx
│   │   │   └── BookingStatus.tsx
│   │   ├── admin/
│   │   │   ├── BookingsList.tsx
│   │   │   ├── StaffSchedule.tsx
│   │   │   └── ReportsChart.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Card.tsx
│   │
│   ├── lib/                          # Utility functions
│   │   ├── api.ts                    # API client
│   │   ├── auth.ts                   # Auth utilities
│   │   ├── db.ts                     # Database client
│   │   ├── payment.ts                # Payment integration
│   │   └── utils.ts                  # General utilities
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useBooking.ts
│   │   └── useUser.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── user.ts
│   │   ├── booking.ts
│   │   ├── service.ts
│   │   └── common.ts
│   │
│   ├── services/                     # Business logic
│   │   ├── bookingService.ts
│   │   ├── paymentService.ts
│   │   ├── emailService.ts
│   │   └── analyticsService.ts
│   │
│   ├── store/                        # State management (Zustand)
│   │   ├── authStore.ts
│   │   ├── bookingStore.ts
│   │   └── uiStore.ts
│   │
│   ├── styles/                       # Global styles
│   │   ├── globals.css               # Tailwind + custom CSS
│   │   └── variables.css             # Design tokens
│   │
│   └── middleware.ts                 # Next.js middleware (auth, etc)
│
├── public/                           # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── backend/                          # Separate Express backend (optional)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── config/
│   ├── package.json
│   └── tsconfig.json
│
├── .github/workflows/                # CI/CD pipelines
│   ├── tests.yml
│   ├── deploy.yml
│   └── lint.yml
│
├── .env.example                      # Environment variables template
├── .env.local                        # Local secrets (git ignored)
├── eslint.config.js                  # Linting rules
├── tailwind.config.js                # Tailwind CSS config
├── next.config.js                    # Next.js config
├── tsconfig.json                     # TypeScript config
├── package.json
└── README.md
```

### Component Organization

```
Components are organized by feature/domain, not by type:
- ✅ GOOD: components/booking/{BookingForm, BookingCard, TimeSlot}
- ❌ BAD:  components/forms, components/cards, components/modals
```

### State Management Pattern (Zustand)

```typescript
// store/bookingStore.ts
import create from 'zustand';

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (booking: Booking) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  loading: false,
  error: null,
  fetchBookings: async () => {
    // Implementation
  },
  // ...
}));
```

### API Handling Pattern

```typescript
// lib/api.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## 6. Danh sách tính năng mở rộng (Feature Backlog)

| # | Tính năng | Mô tả | Ưu tiên | Độ khó | Thời gian | Trạng thái | Phase |
|---|---|---|---|---|---|---|---|
| 1 | **Online Booking** | Reserve time slots online | 🔴 Critical | Medium | 2 weeks | 📋 Planned | P1 |
| 2 | **Payment Gateway** | Stripe/VNPay integration | 🔴 Critical | Hard | 2 weeks | 📋 Planned | P1 |
| 3 | **Customer Login** | User authentication | 🔴 Critical | Hard | 1 week | 📋 Planned | P2 |
| 4 | **Email Notifications** | Booking confirmation emails | 🟠 High | Medium | 3 days | 📋 Planned | P1 |
| 5 | **SMS Notifications** | Send SMS to customers | 🟠 High | Medium | 3 days | 📋 Planned | P1 |
| 6 | **Admin Dashboard** | Manage bookings, staff | 🟠 High | Hard | 2 weeks | 📋 Planned | P2 |
| 7 | **Availability Calendar** | Staff scheduling | 🟠 High | Hard | 1.5 weeks | 📋 Planned | P1 |
| 8 | **Customer Dashboard** | View/cancel bookings | 🟠 High | Medium | 1 week | 📋 Planned | P2 |
| 9 | **Analytics Dashboard** | View sales, bookings | 🟠 High | Medium | 1.5 weeks | 📋 Planned | P3 |
| 10 | **Headless CMS** | Manage content | 🟠 High | Hard | 3 weeks | 📋 Planned | P3 |
| 11 | **AI Chatbot** | Customer support bot | 🟡 Medium | Hard | 2 weeks | 📋 Planned | P3 |
| 12 | **Loyalty Program** | Rewards & points | 🟡 Medium | Medium | 2 weeks | 📋 Planned | P4 |
| 13 | **Mobile App (PWA)** | Progressive web app | 🟡 Medium | Hard | 4 weeks | 📋 Planned | P3 |
| 14 | **Mobile App (Native)** | iOS/Android app | 🟡 Medium | Hard | 8 weeks | 📋 Planned | P4 |
| 15 | **Multi-location** | Support multiple salons | 🟡 Medium | Hard | 4 weeks | 📋 Planned | P4 |
| 16 | **Staff Management** | Track staff performance | 🟡 Medium | Medium | 2 weeks | 📋 Planned | P3 |
| 17 | **Inventory Management** | Track products/supplies | 🟡 Medium | Medium | 2 weeks | 📋 Planned | P4 |
| 18 | **Video Management** | Host salon videos | 🟡 Medium | Easy | 1 week | 📋 Planned | P4 |
| 19 | **Marketing Automation** | Email/SMS campaigns | 🟡 Medium | Hard | 2 weeks | 📋 Planned | P4 |
| 20 | **Social Media Integration** | Auto-post bookings | 🟡 Medium | Medium | 1 week | 📋 Planned | P3 |
| 21 | **SEO Optimization** | Improve search rankings | 🟡 Medium | Medium | 1 week | 📋 Planned | P2 |
| 22 | **Dark Mode** | Theme toggle | 🟢 Low | Easy | 2 days | 📋 Planned | P4 |
| 23 | **Accessibility** | WCAG compliance | 🟢 Low | Medium | 1.5 weeks | 📋 Planned | P2 |
| 24 | **Performance Audit** | Core Web Vitals optimization | 🟡 Medium | Medium | 1 week | 📋 Planned | P2 |

**Legend:**
- 🔴 Critical (blocks other work)
- 🟠 High (important for business)
- 🟡 Medium (nice to have)
- 🟢 Low (polish)

---

## 7. Best Practices & Quy ước khi mở rộng

### 7.1 Coding Standards

#### TypeScript Strict Mode
```typescript
// Enable in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

#### Naming Conventions
```typescript
// Components: PascalCase
const UserProfile = () => {};

// Functions: camelCase
const getUserProfile = () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_BOOKINGS = 50;

// File names: kebab-case for components
// user-profile.tsx, booking-form.tsx

// Database tables: snake_case
// users, booking_slots, staff_schedules
```

#### ESLint & Prettier
```bash
# Setup in project
npm install --save-dev eslint prettier eslint-config-next

# Run before commit
npm run lint
npm run format
```

### 7.2 Performance Optimization

#### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/salon.jpg"
  width={800}
  height={600}
  alt="Salon"
  priority={false}
  placeholder="blur"
/>
```

#### Code Splitting
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { loading: () => <div>Loading...</div> }
);
```

#### Caching Strategy
```typescript
// Cache API responses
export const revalidate = 3600; // ISR: revalidate every hour

// Or use SWR for client-side caching
import useSWR from 'swr';

const { data, error } = useSWR('/api/bookings', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 600000, // 10 minutes
});
```

### 7.3 SEO & Core Web Vitals

#### Meta Tags & Structured Data
```typescript
// app/services/page.tsx
export const metadata: Metadata = {
  title: 'Grey Hair Plucking Services | Nhíp Bạc',
  description: 'Professional grey hair plucking at Phu My Hung...',
  openGraph: {
    title: 'Services',
    images: [{ url: '/og-image.jpg' }],
  },
};

// Add structured data
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Nhíp Bạc',
      // ... more fields
    }),
  }}
/>
```

#### Core Web Vitals Targets
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### 7.4 Security Best Practices

#### Authentication
```typescript
// Use JWT tokens with httpOnly cookies
const res = await fetch('/api/login', {
  method: 'POST',
  credentials: 'include', // Send cookies
  body: JSON.stringify({ email, password }),
});
```

#### Environment Variables
```bash
# .env.local (git ignored)
NEXT_PUBLIC_API_URL=https://api.example.com
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
JWT_SECRET=your-secret-key
```

#### Input Validation
```typescript
// Validate on client and server
import { z } from 'zod';

const bookingSchema = z.object({
  date: z.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  email: z.string().email(),
});

const booking = bookingSchema.parse(data); // Throws if invalid
```

#### SQL Injection Prevention
```typescript
// Use parameterized queries
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email] // Parameterized, safe from injection
);
```

### 7.5 Testing Strategy

#### Unit Tests (Jest)
```typescript
// components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

#### E2E Tests (Playwright/Cypress)
```typescript
// e2e/booking.spec.ts
test('user can complete booking', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="book-button"]');
  await page.fill('[data-testid="date-input"]', '2026-06-15');
  await page.click('[data-testid="confirm-button"]');
  await expect(page).toHaveURL('/confirmation');
});
```

#### Testing Checklist
- ✅ Unit tests (70%+ coverage for critical paths)
- ✅ Integration tests (API + Database)
- ✅ E2E tests (user journeys)
- ✅ Performance tests (load testing)
- ✅ Security tests (OWASP Top 10)

---

## 8. Công nghệ & Tool Stack đề xuất theo giai đoạn

### Phase 1: Cải thiện nền tảng

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | HTML/CSS/JS (keep) | Current | No changes yet |
| **Backend** | Node.js + Express | 20.x LTS | REST API |
| **Language** | TypeScript | 5.x | Type safety |
| **Database** | PostgreSQL | 15+ | Store bookings |
| **ORM** | Prisma | 5.x | Database access |
| **Auth** | JWT + bcrypt | Latest | User authentication |
| **Payment** | Stripe SDK | Latest | Process payments |
| **Email** | SendGrid | Latest | Send emails |
| **Hosting** | Railway | Cloud | Backend + DB |
| **Validation** | Zod | Latest | Input validation |
| **Testing** | Jest + Supertest | Latest | API testing |

### Phase 2: Chuyển sang Modern Framework

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | Next.js | 14.x | Full-stack framework |
| **UI Library** | React | 19.x | Component framework |
| **CSS** | Tailwind CSS | 3.x | Utility-first styling |
| **Components** | Shadcn/ui | Latest | Pre-built components |
| **State** | Zustand | Latest | Client state |
| **Data Fetching** | TanStack Query | Latest | Server state |
| **Validation** | Zod | Latest | Type-safe validation |
| **Hosting** | Vercel | Cloud | Next.js optimized |
| **CI/CD** | GitHub Actions | Latest | Automated tests/deploy |
| **Monitoring** | Sentry | Latest | Error tracking |

### Phase 3: Thêm tính năng động & CMS

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **CMS** | Strapi (self-hosted) | 4.x | Content management |
| **AI** | OpenAI API | gpt-4 | Chatbot |
| **Realtime** | Socket.io | 4.x | Live notifications |
| **Task Queue** | Bull (Redis) | 4.x | Async jobs |
| **Search** | Elasticsearch | 8.x | Full-text search |
| **Cache** | Redis | 7.x | Session + cache |
| **Analytics** | PostHog | Latest | Event tracking |
| **Monitoring** | Grafana | Latest | Metrics dashboard |

### Phase 4: Scale & Tối ưu

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Mobile** | React Native / Flutter | Latest | iOS/Android apps |
| **Container** | Docker | 24.x | Containerization |
| **Orchestration** | Kubernetes | 1.28.x | Container orchestration |
| **API Gateway** | Kong | 3.x | API management |
| **Message Queue** | RabbitMQ / Kafka | Latest | Event streaming |
| **CDN** | Cloudflare | Latest | Global distribution |
| **Database** | Aurora (AWS) | Latest | Managed PostgreSQL |
| **Serverless** | AWS Lambda | Latest | Scalable functions |

---

## 9. Checklist trước khi scale

### ✅ Infrastructure & DevOps
- [ ] Setup version control (Git + GitHub)
- [ ] Setup CI/CD pipeline (GitHub Actions / GitLab CI)
- [ ] Setup staging environment (separate from production)
- [ ] Setup monitoring & alerting (Sentry, DataDog)
- [ ] Setup logging (ELK stack or similar)
- [ ] Setup database backups (automated daily backups)
- [ ] Setup SSL/TLS certificates (HTTPS everywhere)
- [ ] Setup CDN for static assets (Cloudflare)

### ✅ Code Quality
- [ ] Setup linting (ESLint + Prettier)
- [ ] Setup pre-commit hooks (Husky)
- [ ] Setup code review process (GitHub PR reviews required)
- [ ] Add unit tests (target 70%+ coverage)
- [ ] Add E2E tests (critical user journeys)
- [ ] Document code (JSDoc, README)
- [ ] Setup type checking (TypeScript strict mode)

### ✅ Security
- [ ] Audit dependencies (npm audit)
- [ ] Setup CORS properly (allow only frontend domain)
- [ ] Implement rate limiting (prevent API abuse)
- [ ] Setup secrets management (.env files, Vault)
- [ ] Implement CSRF protection
- [ ] Implement SQL injection prevention (parameterized queries)
- [ ] Implement XSS protection (content-security-policy)
- [ ] Conduct security audit (OWASP Top 10)

### ✅ Database
- [ ] Design database schema (normalize properly)
- [ ] Setup database migrations (Prisma migrations)
- [ ] Add database indexes (for performance)
- [ ] Setup database backups (automated)
- [ ] Test disaster recovery (restore from backup)
- [ ] Setup replication (for high availability)

### ✅ Performance
- [ ] Optimize images (WebP, proper sizing)
- [ ] Setup caching strategy (Redis, HTTP cache headers)
- [ ] Optimize frontend (code splitting, lazy loading)
- [ ] Optimize database queries (avoid N+1)
- [ ] Setup CDN (global distribution)
- [ ] Run performance audit (Core Web Vitals)

### ✅ Monitoring & Analytics
- [ ] Setup application monitoring (Sentry, DataDog)
- [ ] Setup business analytics (Google Analytics 4)
- [ ] Setup uptime monitoring (UptimeRobot)
- [ ] Setup error tracking (automatic error reports)
- [ ] Setup performance monitoring (New Relic, APM)
- [ ] Setup custom dashboards (business metrics)

### ✅ Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Setup flow diagrams (architecture)
- [ ] Write deployment guide (how to deploy)
- [ ] Write development guide (how to develop locally)
- [ ] Document database schema
- [ ] Document environment variables
- [ ] Document third-party integrations

### ✅ Testing & QA
- [ ] Setup automated testing pipeline
- [ ] Setup browser testing (cross-browser compatibility)
- [ ] Setup mobile testing (iOS/Android)
- [ ] Setup accessibility testing (WCAG)
- [ ] Setup performance testing (load testing)
- [ ] Setup security testing (penetration testing)
- [ ] Create QA checklist

### ✅ Team & Process
- [ ] Define coding standards
- [ ] Define branching strategy (Git flow)
- [ ] Define deployment strategy
- [ ] Define incident response process
- [ ] Setup team communication (Slack, Discord)
- [ ] Setup knowledge base (Notion, Wiki)
- [ ] Setup project management (Jira, Linear)

---

## 10. Ghi chú & Quyết định quan trọng (Decision Log)

### 📌 Quyết định #1: Framework Selection
**Decision:** Use **Next.js 14** over React/Vite  
**Date:** May 29, 2026  
**Rationale:**
- ✅ Built-in SSR/SSG support (better for SEO)
- ✅ API routes (no separate backend needed initially)
- ✅ Vercel deployment (optimized for Next.js)
- ✅ Better learning resources & community
- ❌ Alternative considered: Astro (too static-focused for dynamic salon site)

---

### 📌 Quyết định #2: Backend Stack
**Decision:** Use **Node.js/Express + TypeScript**  
**Date:** May 29, 2026  
**Rationale:**
- ✅ Same language as frontend (full-stack JS)
- ✅ Large ecosystem (npm packages for everything)
- ✅ Fast development speed
- ✅ Cheap hosting options
- ❌ Alternative considered: Python/Django (good, but different language)

---

### 📌 Quyết định #3: Database Choice
**Decision:** Use **PostgreSQL**  
**Date:** May 29, 2026  
**Rationale:**
- ✅ ACID guarantees (important for payments)
- ✅ Relational model perfect for booking data
- ✅ Mature, stable, widely used
- ✅ Free hosting options (Railway, Render)
- ❌ Alternative considered: MongoDB (too flexible, not ideal for structured data)

---

### 📌 Quyết định #4: Hosting Platform
**Decision:** Use **Vercel + Railway combo**  
**Date:** May 29, 2026  
**Rationale:**
- ✅ Vercel: optimized for Next.js, free tier generous
- ✅ Railway: great value for backend + DB, simple pricing
- ✅ Both have easy deployment (git push)
- ✅ Good free tiers for small projects
- ❌ Alternative considered: AWS (more complex, higher learning curve)

---

### 📌 Quyết định #5: Styling Approach
**Decision:** Migrate to **Tailwind CSS** (from custom CSS)  
**Date:** May 29, 2026  
**Rationale:**
- ✅ Utility-first approach (faster development)
- ✅ Consistent design tokens
- ✅ Large ecosystem (Shadcn/ui, Headless UI)
- ✅ Better maintainability
- ❌ Trade-off: Learning curve for team

---

### 📌 Quyết định #6: Payment Provider
**Decision:** Use **Stripe** (primary), **VNPay** (secondary)  
**Date:** May 29, 2026  
**Rationale:**
- ✅ Stripe: Global, reliable, good documentation
- ✅ VNPay: Local Vietnam, familiar to customers
- ✅ Both have good SDKs
- ✅ Supporting both increases conversion
- ⏱️ Timeline: Evaluate VNPay in Phase 2

---

### 📌 Quyết định #7: CMS vs Custom Admin
**Decision:** Use **Strapi (self-hosted)** for CMS  
**Date:** May 29, 2026  
**Rationale:**
- ✅ Open-source (no vendor lock-in)
- ✅ Headless CMS (flexible content)
- ✅ Easy to self-host on same server
- ✅ Good community & documentation
- ❌ Alternative considered: Contentful (SaaS, easier but costs money)

---

### 📌 Quyết định #8: Authentication Strategy
**Decision:** Use **JWT + Refresh Tokens**  
**Date:** May 29, 2026  
**Rationale:**
- ✅ Stateless (scales well)
- ✅ Supports mobile apps
- ✅ Industry standard
- ❌ Trade-off: Need to implement token rotation
- 🔄 Alternative: Consider Auth0 if team prefers managed solution

---

### 📌 Quyết định #9: Email Service
**Decision:** Use **SendGrid** for transactional emails  
**Date:** May 29, 2026  
**Rationale:**
- ✅ Reliable (high deliverability)
- ✅ Free tier generous (100 emails/day)
- ✅ Good documentation
- ✅ Affordable at scale
- ❌ Alternative: Nodemailer (free, but own infrastructure)

---

### 📌 Quyết định #10: Mobile Strategy
**Decision:** Build **PWA first**, then native apps  
**Date:** May 29, 2026  
**Rationale:**
- ✅ PWA is faster to build (uses Next.js)
- ✅ Works on all devices
- ✅ Lower maintenance (single codebase)
- ⏱️ Native apps (React Native/Flutter) in Phase 4
- 📊 Evaluation: Will assess user metrics in Phase 2

---

### 🔄 Ongoing Decisions Needed
- [ ] Decide on CI/CD tool (GitHub Actions vs GitLab CI)
- [ ] Decide on monitoring solution (Sentry vs DataDog)
- [ ] Decide on analytics (PostHog vs Mixpanel vs Google Analytics 4)
- [ ] Decide on project management tool (Linear vs Jira)
- [ ] Decide on API documentation (Swagger vs GraphQL)

---

## 📊 Timeline Summary

```
2026
├── Q2 (Current)
│   └── Phase 0: Planning & Documentation ✅
│
├── Q3 (Jun - Aug)
│   └── Phase 1: Backend & Booking System (3-4 weeks)
│       └── Phase 2: Next.js Migration (3-4 weeks)
│
└── Q4 (Sep - Dec)
    └── Phase 3: CMS & Advanced Features (2-3 months)

2027
└── Q1-Q2
    └── Phase 4: Scale & Mobile Apps (4-6 months)
```

---

## 📈 Success Metrics

### Phase 1 Metrics (6 weeks)
- ✅ Backend API fully functional
- ✅ 100+ test bookings completed
- ✅ Payment processing working
- ✅ Email notifications sending
- ✅ Admin panel operational

### Phase 2 Metrics (8 weeks)
- ✅ Next.js frontend production ready
- ✅ Customer login functional
- ✅ Core Web Vitals > 80
- ✅ Mobile responsiveness 100%
- ✅ Lighthouse score > 90

### Phase 3 Metrics (3 months)
- ✅ CMS operational with content migrated
- ✅ Chatbot answering 80%+ FAQ questions
- ✅ Analytics dashboard tracking key metrics
- ✅ Email/SMS campaigns running
- ✅ Staff dashboard in use

### Phase 4 Metrics (6 months)
- ✅ Multi-location support live
- ✅ Mobile app (iOS/Android) launched
- ✅ Loyalty program active (1000+ members)
- ✅ 10,000+ monthly website visitors
- ✅ 60% online booking rate

---

**Document Status:** 🟢 Active  
**Last Updated:** May 29, 2026  
**Next Review:** August 1, 2026 (end of Phase 1)  
**Maintainer:** Development Team

---

*This is a living document and will be updated as the project evolves.*
