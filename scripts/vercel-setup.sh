#!/bin/bash

# RakGame Vercel Deployment Setup Script
# This script helps automate the Vercel deployment configuration

set -e

echo "🚀 RakGame Vercel Deployment Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✓ Vercel CLI installed${NC}"
else
    echo -e "${GREEN}✓ Vercel CLI found${NC}"
fi

echo ""
echo "Step 1: Login to Vercel"
echo "----------------------"
vercel login

echo ""
echo "Step 2: Link Project to Vercel"
echo "------------------------------"
echo "This will connect your local project to Vercel."
echo "Choose 'Link to existing project' if you've already created one,"
echo "or 'Set up and deploy' to create a new project."
echo ""
vercel link

echo ""
echo "Step 3: Configure Environment Variables"
echo "---------------------------------------"
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo -e "${GREEN}✓ Found .env.local file${NC}"
    echo ""
    echo "Would you like to sync environment variables from .env.local to Vercel?"
    echo "This will add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
    read -p "Sync environment variables? (y/n): " sync_env
    
    if [ "$sync_env" = "y" ]; then
        # Extract environment variables
        if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
            SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
            echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
            echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL preview
            echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_URL added${NC}"
        fi
        
        if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
            SUPABASE_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f2)
            echo "$SUPABASE_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
            echo "$SUPABASE_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
            echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_ANON_KEY added${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠ .env.local not found${NC}"
    echo "You'll need to add environment variables manually:"
    echo "  vercel env add NEXT_PUBLIC_SUPABASE_URL production"
    echo "  vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production"
fi

echo ""
echo "Step 4: Verify Configuration"
echo "----------------------------"
echo "Listing environment variables..."
vercel env ls

echo ""
echo "Step 5: Test Build"
echo "-----------------"
read -p "Would you like to test the build locally? (y/n): " test_build

if [ "$test_build" = "y" ]; then
    echo "Running build..."
    npm run build
    echo -e "${GREEN}✓ Build successful${NC}"
fi

echo ""
echo "Step 6: Deploy to Vercel"
echo "-----------------------"
read -p "Would you like to deploy now? (y/n): " deploy_now

if [ "$deploy_now" = "y" ]; then
    echo "Deploying to production..."
    vercel --prod
    echo -e "${GREEN}✓ Deployment complete${NC}"
else
    echo "You can deploy later with: vercel --prod"
fi

echo ""
echo "Step 7: Domain Configuration"
echo "---------------------------"
echo "To add your custom domain (rakgame.app):"
echo "  1. Go to https://vercel.com/dashboard"
echo "  2. Select your project"
echo "  3. Go to Settings → Domains"
echo "  4. Add 'rakgame.app'"
echo "  5. Configure DNS records as instructed"
echo ""
echo "DNS Records needed:"
echo "  Type: A, Name: @, Value: 76.76.21.21"
echo "  Type: CNAME, Name: www, Value: cname.vercel-dns.com"

echo ""
echo "Step 8: Enable Analytics"
echo "-----------------------"
echo "To enable Vercel Analytics:"
echo "  1. Go to https://vercel.com/dashboard"
echo "  2. Select your project"
echo "  3. Go to Analytics tab"
echo "  4. Click 'Enable Analytics'"

echo ""
echo "Step 9: GitHub Integration"
echo "-------------------------"
echo "To enable GitHub Actions workflows:"
echo "  1. Get your Vercel token: https://vercel.com/account/tokens"
echo "  2. Get project IDs from: cat .vercel/project.json"
echo "  3. Add these secrets to GitHub:"
echo "     - VERCEL_TOKEN"
echo "     - VERCEL_ORG_ID"
echo "     - VERCEL_PROJECT_ID"
echo "     - NEXT_PUBLIC_SUPABASE_URL"
echo "     - NEXT_PUBLIC_SUPABASE_ANON_KEY"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Vercel Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Configure custom domain (rakgame.app)"
echo "  2. Enable Vercel Analytics"
echo "  3. Set up GitHub Actions secrets"
echo "  4. Push to main branch to trigger deployment"
echo ""
echo "For detailed instructions, see:"
echo "  - docs/DEPLOYMENT.md"
echo "  - DEPLOYMENT_CHECKLIST.md"
echo ""
