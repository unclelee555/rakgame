# RakGame - Game Collection Manager

A web-based application for managing, tracking, and analyzing your game collection across physical and digital formats.

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Update the following variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
rakgame/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── lib/                   # Utility functions and configurations
│   └── supabase/          # Supabase client configurations
│       ├── client.ts      # Browser client
│       ├── server.ts      # Server client
│       └── middleware.ts  # Middleware helper
├── middleware.ts          # Next.js middleware for auth
└── package.json           # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Features

- ✅ User authentication and account management
- ✅ Game collection CRUD operations
- ✅ Seller management
- ✅ Search and filter capabilities
- ✅ Spending analytics dashboard
- ✅ Data export (CSV, JSON, PDF)
- ✅ Cloud synchronization
- ✅ Duplicate detection
- ✅ Responsive design
- ✅ Dark/light theme
- ✅ Internationalization (English/Thai)

## Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/rakgame)

### Automated Deployment Setup

Use the automated setup script:

```bash
./scripts/vercel-setup.sh
```

This script will:
- Install Vercel CLI (if needed)
- Link your project to Vercel
- Configure environment variables
- Test the build
- Deploy to production

### Manual Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](docs/DEPLOYMENT.md).

**Quick steps:**

1. **Connect GitHub to Vercel**
   ```bash
   vercel link
   ```

2. **Configure environment variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   ```

3. **Deploy to production**
   ```bash
   vercel --prod
   ```

4. **Set up custom domain** (optional)
   - Go to Vercel Dashboard → Domains
   - Add `rakgame.app`
   - Configure DNS records

### Continuous Deployment

The project includes GitHub Actions workflows for automatic deployments:

- **Production:** Deploys on push to `main` branch
- **Preview:** Deploys on pull requests

See [GitHub Actions Setup Guide](docs/GITHUB-ACTIONS-SETUP.md) for configuration instructions.

### Deployment Validation

Validate your deployment configuration:

```bash
./scripts/validate-deployment.sh
```

### Monitoring

- **Vercel Analytics:** Track traffic and user behavior
- **Speed Insights:** Monitor Core Web Vitals
- See [Vercel Analytics Guide](docs/VERCEL-ANALYTICS.md) for setup

### Deployment Checklist

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for a complete pre-deployment and post-deployment checklist.

## Documentation

### Deployment
- [Deployment Guide](docs/DEPLOYMENT.md) - Complete deployment instructions
- [Deployment Quick Reference](docs/DEPLOYMENT-QUICK-REFERENCE.md) - Common commands and workflows
- [GitHub Actions Setup](docs/GITHUB-ACTIONS-SETUP.md) - CI/CD configuration
- [Vercel Analytics](docs/VERCEL-ANALYTICS.md) - Analytics and monitoring setup
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Pre and post-deployment checklist

### Features
- [Authentication](docs/AUTHENTICATION.md) - Authentication system documentation
- [Cloud Sync](docs/CLOUD-SYNC.md) - Cloud synchronization details
- [Error Handling](docs/ERROR-HANDLING.md) - Error handling strategies
- [Export Functionality](docs/EXPORT-FUNCTIONALITY.md) - Data export features
- [Game Collection](docs/GAME-COLLECTION.md) - Collection management
- [Internationalization](docs/INTERNATIONALIZATION.md) - i18n implementation
- [Performance](docs/PERFORMANCE-OPTIMIZATIONS.md) - Performance optimizations
- [Responsive Design](docs/RESPONSIVE-DESIGN.md) - Responsive design approach

## License

Private project
