# RakGame Deployment Checklist

Use this checklist to ensure a smooth deployment to Vercel.

## Pre-Deployment Checklist

### Code Preparation
- [ ] All tests passing locally
- [ ] No console errors in browser
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables documented
- [ ] `.env.local.example` file updated
- [ ] All dependencies in `package.json`
- [ ] No hardcoded secrets in code

### Supabase Setup
- [ ] Supabase project created
- [ ] Database schema migrated
- [ ] Row Level Security policies enabled
- [ ] Storage bucket created for images
- [ ] Storage policies configured
- [ ] Supabase URL obtained
- [ ] Supabase anon key obtained

### GitHub Setup
- [ ] Repository created on GitHub
- [ ] Code pushed to `main` branch
- [ ] `.gitignore` properly configured
- [ ] README.md updated
- [ ] Branch protection rules set (optional)

## Vercel Deployment Steps

### Initial Setup
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Project imported from GitHub
- [ ] Framework preset: Next.js detected
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`

### Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added (Production)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added (Production)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added (Preview)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added (Preview)
- [ ] Environment variables verified

### Domain Configuration
- [ ] Custom domain added: `rakgame.app`
- [ ] DNS A record configured: `76.76.21.21`
- [ ] DNS CNAME record configured: `cname.vercel-dns.com`
- [ ] SSL certificate issued (automatic)
- [ ] Domain verified and active

### Deployment Settings
- [ ] Production branch set to `main`
- [ ] Automatic deployments enabled
- [ ] Preview deployments enabled for PRs
- [ ] Build & Development Settings reviewed
- [ ] Root directory: `./`
- [ ] Node.js version: 20.x (automatic)

### Analytics & Monitoring
- [ ] Vercel Analytics enabled
- [ ] Speed Insights enabled (optional)
- [ ] Deployment notifications configured
- [ ] Error tracking reviewed

## Post-Deployment Verification

### Functional Testing
- [ ] Homepage loads successfully
- [ ] Authentication works (login/register)
- [ ] Dashboard displays correctly
- [ ] Game CRUD operations work
- [ ] Seller management works
- [ ] Search and filters work
- [ ] Analytics display correctly
- [ ] Export functionality works
- [ ] Image uploads work
- [ ] Theme switching works
- [ ] Language switching works

### Performance Testing
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Images optimized and loading
- [ ] No console errors
- [ ] No 404 errors

### Security Testing
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Authentication required for protected routes
- [ ] RLS policies working
- [ ] No exposed secrets in client code
- [ ] CORS configured correctly

### Cross-Browser Testing
- [ ] Chrome (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Edge (desktop)

### Responsive Testing
- [ ] Mobile (320px - 767px)
- [ ] Tablet (768px - 1023px)
- [ ] Desktop (1024px+)
- [ ] Large screens (1920px+)

## Continuous Deployment Verification

### Automatic Deployments
- [ ] Push to `main` triggers production deployment
- [ ] Deployment completes successfully
- [ ] Production URL updated
- [ ] Deployment notification received

### Preview Deployments
- [ ] Create test PR
- [ ] Preview deployment triggered
- [ ] Preview URL generated
- [ ] Preview URL posted to PR
- [ ] Changes visible on preview
- [ ] Merge PR triggers production deployment

## Rollback Plan

### If Deployment Fails
1. [ ] Check build logs in Vercel Dashboard
2. [ ] Verify environment variables
3. [ ] Check for breaking changes
4. [ ] Test build locally
5. [ ] Fix issues and redeploy

### If Production Has Issues
1. [ ] Identify last working deployment
2. [ ] Click "Promote to Production" on working deployment
3. [ ] Verify rollback successful
4. [ ] Fix issues in development
5. [ ] Deploy fix when ready

## Monitoring Setup

### Daily Checks
- [ ] Check Vercel Analytics for traffic
- [ ] Review error logs
- [ ] Monitor performance metrics
- [ ] Check Supabase usage

### Weekly Checks
- [ ] Review deployment history
- [ ] Check bandwidth usage
- [ ] Review build times
- [ ] Update dependencies if needed

### Monthly Checks
- [ ] Review Vercel billing
- [ ] Review Supabase billing
- [ ] Audit security settings
- [ ] Update documentation

## Troubleshooting Common Issues

### Build Failures
**Symptom:** Deployment fails during build
- [ ] Check build logs for errors
- [ ] Verify all dependencies installed
- [ ] Check for TypeScript errors
- [ ] Verify environment variables set

### Runtime Errors
**Symptom:** App crashes after deployment
- [ ] Check runtime logs in Vercel
- [ ] Verify Supabase connection
- [ ] Check for missing environment variables
- [ ] Test API routes individually

### Performance Issues
**Symptom:** Slow page loads
- [ ] Check bundle size in build logs
- [ ] Review Vercel Analytics
- [ ] Optimize images
- [ ] Enable caching

### Domain Issues
**Symptom:** Domain not resolving
- [ ] Verify DNS records
- [ ] Check DNS propagation (24-48 hours)
- [ ] Verify domain in Vercel Dashboard
- [ ] Check SSL certificate status

## Success Criteria

Deployment is successful when:
- [ ] Production URL (rakgame.app) is accessible
- [ ] All core features work correctly
- [ ] Performance meets targets (Lighthouse > 90)
- [ ] No critical errors in logs
- [ ] Automatic deployments working
- [ ] Preview deployments working
- [ ] Analytics tracking data
- [ ] Security headers present
- [ ] HTTPS enforced
- [ ] Mobile responsive

## Next Steps After Deployment

- [ ] Announce launch to users
- [ ] Monitor for issues in first 24 hours
- [ ] Gather user feedback
- [ ] Plan next iteration
- [ ] Document lessons learned

## Emergency Contacts

- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/support
- **DNS Provider Support:** [Your DNS provider]

## Notes

Date deployed: _______________
Deployed by: _______________
Production URL: https://rakgame.app
Vercel Project: _______________
Issues encountered: _______________
