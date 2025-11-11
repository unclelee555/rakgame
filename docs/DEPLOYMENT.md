# Deployment Guide

This document provides step-by-step instructions for deploying RakGame to Vercel with automatic CI/CD from GitHub.

## Prerequisites

- GitHub account with repository access
- Vercel account (sign up at https://vercel.com)
- Supabase project with URL and anon key
- Domain name (rakgame.app) configured with DNS provider

## Step 1: Connect GitHub Repository to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Authorize Vercel to access your GitHub account
5. Select the RakGame repository
6. Click "Import"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Link the project
vercel link

# Follow the prompts to connect your GitHub repository
```

## Step 2: Configure Environment Variables

### In Vercel Dashboard:

1. Go to your project settings: https://vercel.com/[your-username]/rakgame/settings
2. Navigate to "Environment Variables"
3. Add the following variables for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

### Using Vercel CLI:

```bash
# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste your Supabase anon key when prompted

# Repeat for preview and development environments
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
```

## Step 3: Set Up Custom Domain (rakgame.app)

### In Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Domains"
3. Click "Add Domain"
4. Enter `rakgame.app`
5. Follow the DNS configuration instructions provided by Vercel

### DNS Configuration:

Add the following records to your DNS provider:

**For apex domain (rakgame.app):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Verification:**
```bash
# Check DNS propagation
dig rakgame.app
dig www.rakgame.app
```

Wait 24-48 hours for DNS propagation (usually faster).

## Step 4: Enable Automatic Deployments

### Production Deployments (main branch):

Automatic deployments are enabled by default when you connect your GitHub repository.

**How it works:**
1. Push code to `main` branch
2. Vercel automatically detects the push
3. Runs `npm install` and `npm run build`
4. Deploys to production (rakgame.app)
5. Sends deployment notification

### Configure in Vercel Dashboard:

1. Go to Project Settings → Git
2. Ensure "Production Branch" is set to `main`
3. Enable "Automatic Deployments from Git"

## Step 5: Configure Preview Deployments for Pull Requests

Preview deployments are automatically enabled for all pull requests.

**How it works:**
1. Create a pull request to `main` branch
2. Vercel automatically builds and deploys a preview
3. Preview URL is posted as a comment on the PR
4. Each commit to the PR triggers a new preview deployment

### Configure in Vercel Dashboard:

1. Go to Project Settings → Git
2. Enable "Deploy Previews"
3. Select "All branches" or "Only branches with pull requests"
4. Enable "Comments on Pull Requests"

### GitHub Actions Integration (Optional):

The repository includes GitHub Actions workflows for additional CI/CD:

- `.github/workflows/vercel-production.yml` - Production deployments
- `.github/workflows/vercel-preview.yml` - Preview deployments

**To enable GitHub Actions:**

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following secrets:

```
VERCEL_TOKEN=[your-vercel-token]
VERCEL_ORG_ID=[your-org-id]
VERCEL_PROJECT_ID=[your-project-id]
NEXT_PUBLIC_SUPABASE_URL=[your-supabase-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

**Get Vercel credentials:**
```bash
# Get Vercel token from: https://vercel.com/account/tokens
# Get org and project IDs:
vercel link
cat .vercel/project.json
```

## Step 6: Set Up Vercel Analytics

### Enable Vercel Analytics:

1. Go to your project in Vercel Dashboard
2. Navigate to "Analytics" tab
3. Click "Enable Analytics"
4. Choose "Web Analytics" (free tier)

### Add Analytics to Your App:

The analytics script is automatically injected by Vercel when enabled. No code changes needed.

### View Analytics:

1. Go to https://vercel.com/[your-username]/rakgame/analytics
2. View metrics:
   - Page views
   - Unique visitors
   - Top pages
   - Referrers
   - Devices and browsers
   - Core Web Vitals (LCP, FID, CLS)

### Enable Speed Insights (Optional):

1. Go to "Speed Insights" tab
2. Click "Enable Speed Insights"
3. Monitor real-user performance metrics

## Deployment Verification

### Check Production Deployment:

```bash
# Visit your production URL
curl -I https://rakgame.app

# Should return 200 OK with security headers
```

### Verify Environment Variables:

```bash
# Check if Supabase connection works
curl https://rakgame.app/api/health
```

### Monitor Build Logs:

1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. View build logs and runtime logs
4. Check for any errors or warnings

## Rollback Procedure

If a deployment causes issues:

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"
4. Confirm the rollback

Or use CLI:
```bash
vercel rollback
```

## Continuous Deployment Workflow

### Standard Workflow:

1. **Development:**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

2. **Preview:**
   - Create pull request on GitHub
   - Vercel automatically deploys preview
   - Review preview URL in PR comments
   - Test changes on preview deployment

3. **Production:**
   ```bash
   # Merge PR to main
   git checkout main
   git pull origin main
   # Vercel automatically deploys to production
   ```

### Emergency Hotfix:

```bash
git checkout -b hotfix/critical-bug
# Fix the bug
git commit -m "Fix critical bug"
git push origin hotfix/critical-bug
# Create PR and merge immediately
# Vercel deploys to production automatically
```

## Monitoring and Alerts

### Set Up Deployment Notifications:

1. Go to Project Settings → Notifications
2. Enable notifications for:
   - Deployment started
   - Deployment ready
   - Deployment failed
3. Choose notification channels:
   - Email
   - Slack
   - Discord
   - Webhook

### Monitor Performance:

- **Vercel Analytics:** Real-time traffic and performance
- **Vercel Speed Insights:** Core Web Vitals monitoring
- **Supabase Dashboard:** Database performance and usage
- **Browser DevTools:** Client-side performance testing

## Troubleshooting

### Build Failures:

**Issue:** Build fails with "Module not found"
```bash
# Solution: Clear cache and rebuild
vercel --force
```

**Issue:** Environment variables not available
```bash
# Solution: Check environment variable configuration
vercel env ls
```

### Domain Issues:

**Issue:** Domain not resolving
```bash
# Check DNS configuration
dig rakgame.app
nslookup rakgame.app

# Verify Vercel DNS settings
vercel domains ls
```

### Performance Issues:

**Issue:** Slow page loads
- Check Vercel Analytics for bottlenecks
- Review bundle size in build logs
- Enable Edge caching for static assets
- Optimize images with Next.js Image component

## Security Best Practices

1. **Never commit secrets to Git:**
   - Use `.env.local` for local development
   - Use Vercel environment variables for production

2. **Enable security headers:**
   - Already configured in `vercel.json`
   - Includes CSP, X-Frame-Options, etc.

3. **Use HTTPS only:**
   - Automatically enforced by Vercel
   - HTTP requests redirect to HTTPS

4. **Rotate secrets regularly:**
   - Update Supabase keys periodically
   - Update Vercel tokens if compromised

## Cost Optimization

### Vercel Free Tier Limits:

- 100 GB bandwidth per month
- 100 hours of build time per month
- Unlimited deployments
- Unlimited preview deployments

### Tips to Stay Within Limits:

1. Optimize images to reduce bandwidth
2. Enable caching for static assets
3. Use incremental static regeneration
4. Monitor usage in Vercel Dashboard

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase + Vercel Integration](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Custom Domain Setup](https://vercel.com/docs/concepts/projects/domains)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

If you encounter issues:

1. Check Vercel Status: https://www.vercel-status.com/
2. Review build logs in Vercel Dashboard
3. Check Supabase status: https://status.supabase.com/
4. Contact Vercel Support: https://vercel.com/support
