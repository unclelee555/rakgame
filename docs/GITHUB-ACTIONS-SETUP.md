# GitHub Actions Setup Guide

This guide explains how to configure GitHub Actions for automatic deployments to Vercel.

## Overview

The repository includes two GitHub Actions workflows:

1. **Production Deployment** (`.github/workflows/vercel-production.yml`)
   - Triggers on push to `main` branch
   - Deploys to production (rakgame.app)

2. **Preview Deployment** (`.github/workflows/vercel-preview.yml`)
   - Triggers on pull requests to `main` branch
   - Creates preview deployments for testing

## Prerequisites

- GitHub repository with RakGame code
- Vercel account with project created
- Vercel CLI installed locally

## Step 1: Get Vercel Credentials

### 1.1 Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it "GitHub Actions"
4. Set scope to "Full Account"
5. Click "Create"
6. Copy the token (you won't see it again!)

### 1.2 Get Organization and Project IDs

```bash
# Link your project if not already done
vercel link

# View project configuration
cat .vercel/project.json
```

You'll see output like:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

Copy both `orgId` and `projectId`.

## Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Add the following secrets:

### Required Secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `VERCEL_TOKEN` | Your Vercel authentication token | `xxxxxxxxxxxxxxxx` |
| `VERCEL_ORG_ID` | Your Vercel organization ID | `team_xxxxxxxxxxxxx` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | `prj_xxxxxxxxxxxxx` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Adding Each Secret:

For each secret:
1. Click "New repository secret"
2. Enter the name (e.g., `VERCEL_TOKEN`)
3. Paste the value
4. Click "Add secret"

## Step 3: Verify Workflows

### Check Workflow Files

Ensure these files exist in your repository:

```
.github/
└── workflows/
    ├── vercel-production.yml
    └── vercel-preview.yml
```

### Production Workflow (vercel-production.yml)

```yaml
name: Vercel Production Deployment

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

### Preview Workflow (vercel-preview.yml)

```yaml
name: Vercel Preview Deployment

on:
  pull_request:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
```

## Step 4: Test the Workflows

### Test Production Deployment

1. Make a small change to your code
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Test production deployment"
   git push origin main
   ```
3. Go to GitHub → Actions tab
4. Watch the "Vercel Production Deployment" workflow run
5. Verify deployment at https://rakgame.app

### Test Preview Deployment

1. Create a new branch:
   ```bash
   git checkout -b test-preview
   ```
2. Make a small change
3. Commit and push:
   ```bash
   git add .
   git commit -m "Test preview deployment"
   git push origin test-preview
   ```
4. Create a pull request on GitHub
5. Watch the "Vercel Preview Deployment" workflow run
6. Check the PR for the preview URL comment

## Step 5: Monitor Deployments

### View Workflow Runs

1. Go to your GitHub repository
2. Click "Actions" tab
3. See all workflow runs with status
4. Click on a run to see detailed logs

### View Deployment Status

Each workflow run shows:
- ✅ Success: Deployment completed
- ❌ Failure: Check logs for errors
- 🟡 In Progress: Currently deploying

### Common Status Messages

- "Setup Node.js" - Installing Node.js
- "Install dependencies" - Running `npm ci`
- "Build" - Running `npm run build`
- "Deploy to Vercel" - Uploading to Vercel

## Troubleshooting

### Build Fails with "Module not found"

**Problem:** Dependencies not installed correctly

**Solution:**
```bash
# Ensure package-lock.json is committed
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Build Fails with "Environment variable not found"

**Problem:** Missing or incorrect secrets

**Solution:**
1. Verify all secrets are added in GitHub Settings
2. Check secret names match exactly (case-sensitive)
3. Ensure no extra spaces in secret values

### Deployment Fails with "Invalid token"

**Problem:** Vercel token is incorrect or expired

**Solution:**
1. Generate a new token at https://vercel.com/account/tokens
2. Update `VERCEL_TOKEN` secret in GitHub
3. Re-run the workflow

### Deployment Succeeds but Site Shows Errors

**Problem:** Environment variables not set in Vercel

**Solution:**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy from Vercel Dashboard

### Preview Deployment Not Triggered

**Problem:** Workflow not running on pull requests

**Solution:**
1. Check that `.github/workflows/vercel-preview.yml` exists
2. Ensure PR is targeting `main` branch
3. Check GitHub Actions are enabled in repository settings

## Advanced Configuration

### Deploy Only on Specific Paths

Modify workflow to deploy only when certain files change:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'app/**'
      - 'components/**'
      - 'lib/**'
      - 'package.json'
```

### Add Deployment Notifications

Add Slack notification on deployment:

```yaml
- name: Notify Slack
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to production successful!'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Run Tests Before Deployment

Add test step before deployment:

```yaml
- name: Run tests
  run: npm test
```

### Cache Dependencies

Speed up builds by caching node_modules:

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

## Security Best Practices

1. **Never commit secrets to Git**
   - Always use GitHub Secrets
   - Add `.env*` to `.gitignore`

2. **Use minimal token scopes**
   - Create separate tokens for different purposes
   - Rotate tokens regularly

3. **Limit workflow permissions**
   - Use `permissions` key in workflows
   - Grant only necessary permissions

4. **Review workflow runs**
   - Check logs for sensitive data exposure
   - Monitor for unauthorized changes

## Workflow Status Badges

Add status badges to your README:

```markdown
![Production Deployment](https://github.com/[username]/rakgame/actions/workflows/vercel-production.yml/badge.svg)
![Preview Deployment](https://github.com/[username]/rakgame/actions/workflows/vercel-preview.yml/badge.svg)
```

## Disabling Workflows

To temporarily disable a workflow:

1. Go to GitHub → Actions
2. Click on the workflow name
3. Click "..." → "Disable workflow"

Or delete the workflow file:
```bash
git rm .github/workflows/vercel-production.yml
git commit -m "Disable production workflow"
git push
```

## Alternative: Vercel Git Integration

If you prefer Vercel's native Git integration over GitHub Actions:

1. Go to Vercel Dashboard → Project Settings → Git
2. Connect your GitHub repository
3. Enable automatic deployments
4. Disable GitHub Actions workflows

**Pros of Vercel Git Integration:**
- Simpler setup (no secrets needed)
- Faster deployments
- Better integration with Vercel features

**Pros of GitHub Actions:**
- More control over deployment process
- Can run tests and other checks
- Can integrate with other tools
- Deployment logs in GitHub

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Action (GitHub)](https://github.com/amondnet/vercel-action)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Support

If you encounter issues:

1. Check workflow logs in GitHub Actions
2. Verify all secrets are correctly set
3. Test build locally: `npm run build`
4. Check Vercel Dashboard for deployment status
5. Review this guide for troubleshooting steps
