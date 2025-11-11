# Deployment Quick Reference

Quick reference for common deployment tasks and commands.

## Initial Setup

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Link Project
```bash
vercel link
```

## Environment Variables

### Add Environment Variable
```bash
# Production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Preview
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview

# Development
vercel env add NEXT_PUBLIC_SUPABASE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development
```

### List Environment Variables
```bash
vercel env ls
```

### Remove Environment Variable
```bash
vercel env rm VARIABLE_NAME production
```

### Pull Environment Variables
```bash
vercel env pull .env.local
```

## Deployment Commands

### Deploy to Preview
```bash
vercel
```

### Deploy to Production
```bash
vercel --prod
```

### Deploy with Force Rebuild
```bash
vercel --prod --force
```

### Deploy Specific Branch
```bash
git checkout feature-branch
vercel
```

## Project Management

### Check Deployment Status
```bash
vercel ls
```

### View Project Info
```bash
vercel inspect
```

### View Logs
```bash
vercel logs [deployment-url]
```

### Check Who's Logged In
```bash
vercel whoami
```

## Domain Management

### List Domains
```bash
vercel domains ls
```

### Add Domain
```bash
vercel domains add rakgame.app
```

### Remove Domain
```bash
vercel domains rm rakgame.app
```

### Verify Domain
```bash
vercel domains verify rakgame.app
```

## Rollback

### List Deployments
```bash
vercel ls
```

### Promote Deployment to Production
```bash
vercel promote [deployment-url]
```

### Rollback to Previous Deployment
```bash
vercel rollback
```

## Build and Test

### Test Build Locally
```bash
npm run build
```

### Start Production Server Locally
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## GitHub Actions

### View Workflow Status
```bash
gh workflow list
gh workflow view
```

### Trigger Manual Workflow
```bash
gh workflow run vercel-production.yml
```

### View Workflow Runs
```bash
gh run list
gh run view [run-id]
```

## Automated Scripts

### Run Setup Script
```bash
./scripts/vercel-setup.sh
```

### Validate Deployment
```bash
./scripts/validate-deployment.sh
```

### Run Deployment Check
```bash
./scripts/deploy-check.sh
```

## Troubleshooting

### Clear Build Cache
```bash
vercel --prod --force
```

### Check Build Logs
```bash
vercel logs [deployment-url] --follow
```

### Inspect Deployment
```bash
vercel inspect [deployment-url]
```

### Test Environment Variables
```bash
vercel env pull .env.local
cat .env.local
```

## Common Workflows

### Deploy New Feature
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "Add new feature"

# 3. Push to GitHub
git push origin feature/new-feature

# 4. Create PR (triggers preview deployment)
gh pr create

# 5. Merge PR (triggers production deployment)
gh pr merge
```

### Hotfix Production Issue
```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-bug

# 2. Fix the bug
git add .
git commit -m "Fix critical bug"

# 3. Deploy immediately
vercel --prod

# 4. Push to GitHub
git push origin hotfix/critical-bug

# 5. Create and merge PR
gh pr create
gh pr merge
```

### Rollback Bad Deployment
```bash
# 1. List recent deployments
vercel ls

# 2. Find last working deployment
vercel inspect [deployment-url]

# 3. Promote to production
vercel promote [deployment-url]

# Or use rollback command
vercel rollback
```

## Environment-Specific Commands

### Production
```bash
# Deploy to production
vercel --prod

# View production logs
vercel logs --prod

# List production deployments
vercel ls --prod
```

### Preview
```bash
# Deploy preview
vercel

# View preview logs
vercel logs [preview-url]
```

### Development
```bash
# Run dev server
npm run dev

# Pull environment variables
vercel env pull .env.local
```

## Monitoring

### Check Deployment Status
```bash
# Via CLI
vercel ls

# Via curl
curl -I https://rakgame.app
```

### View Analytics
```bash
# Open in browser
open https://vercel.com/[username]/rakgame/analytics
```

### Check Performance
```bash
# Open Speed Insights
open https://vercel.com/[username]/rakgame/speed-insights
```

## Security

### Rotate Secrets
```bash
# Remove old secret
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Add new secret
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Redeploy
vercel --prod --force
```

### Audit Dependencies
```bash
npm audit
npm audit fix
```

### Update Dependencies
```bash
npm update
npm outdated
```

## Useful URLs

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Project Settings:** https://vercel.com/[username]/rakgame/settings
- **Deployments:** https://vercel.com/[username]/rakgame/deployments
- **Analytics:** https://vercel.com/[username]/rakgame/analytics
- **Speed Insights:** https://vercel.com/[username]/rakgame/speed-insights
- **Domains:** https://vercel.com/[username]/rakgame/settings/domains
- **Environment Variables:** https://vercel.com/[username]/rakgame/settings/environment-variables

## GitHub CLI Commands

### Install GitHub CLI
```bash
# macOS
brew install gh

# Linux
sudo apt install gh

# Windows
winget install GitHub.cli
```

### Login to GitHub
```bash
gh auth login
```

### Create Pull Request
```bash
gh pr create --title "Feature: Add new feature" --body "Description"
```

### Merge Pull Request
```bash
gh pr merge --squash
```

### View PR Status
```bash
gh pr status
gh pr view
```

## DNS Configuration

### Check DNS Records
```bash
dig rakgame.app
dig www.rakgame.app
nslookup rakgame.app
```

### Verify DNS Propagation
```bash
# Check from multiple locations
curl https://dns.google/resolve?name=rakgame.app&type=A
```

## Performance Testing

### Lighthouse CLI
```bash
npm install -g lighthouse
lighthouse https://rakgame.app --view
```

### Check Bundle Size
```bash
npm run build
# Check .next/static/chunks for bundle sizes
```

### Analyze Bundle
```bash
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

## Backup and Export

### Export Deployment
```bash
vercel pull
```

### Backup Environment Variables
```bash
vercel env pull .env.backup
```

### Export Analytics Data
```bash
# Via Vercel Dashboard → Analytics → Export
```

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Vercel Status:** https://www.vercel-status.com
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs

## Emergency Contacts

- **Vercel Support:** support@vercel.com
- **Vercel Status Updates:** https://twitter.com/vercel_status
- **Community:** https://github.com/vercel/vercel/discussions
