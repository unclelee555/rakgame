#!/bin/bash

# RakGame Deployment Validation Script
# This script validates that the deployment is configured correctly

set -e

echo "🔍 RakGame Deployment Validation"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Helper functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

check_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. Check local environment
echo "1. Checking Local Environment"
echo "-----------------------------"

if [ -f ".env.local" ]; then
    check_pass ".env.local file exists"
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        check_pass "NEXT_PUBLIC_SUPABASE_URL found in .env.local"
    else
        check_fail "NEXT_PUBLIC_SUPABASE_URL missing in .env.local"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        check_pass "NEXT_PUBLIC_SUPABASE_ANON_KEY found in .env.local"
    else
        check_fail "NEXT_PUBLIC_SUPABASE_ANON_KEY missing in .env.local"
    fi
else
    check_warn ".env.local file not found (needed for local development)"
fi

if [ -f ".env.local.example" ]; then
    check_pass ".env.local.example file exists"
else
    check_warn ".env.local.example file not found"
fi

echo ""

# 2. Check package.json
echo "2. Checking Package Configuration"
echo "---------------------------------"

if [ -f "package.json" ]; then
    check_pass "package.json exists"
    
    if grep -q '"build"' package.json; then
        check_pass "Build script defined"
    else
        check_fail "Build script missing in package.json"
    fi
    
    if grep -q '"start"' package.json; then
        check_pass "Start script defined"
    else
        check_fail "Start script missing in package.json"
    fi
else
    check_fail "package.json not found"
fi

if [ -f "package-lock.json" ]; then
    check_pass "package-lock.json exists"
else
    check_warn "package-lock.json not found (recommended for consistent builds)"
fi

echo ""

# 3. Check Next.js configuration
echo "3. Checking Next.js Configuration"
echo "---------------------------------"

if [ -f "next.config.js" ]; then
    check_pass "next.config.js exists"
    
    if grep -q "remotePatterns" next.config.js; then
        check_pass "Image optimization configured"
    else
        check_warn "Image optimization not configured"
    fi
else
    check_fail "next.config.js not found"
fi

echo ""

# 4. Check Vercel configuration
echo "4. Checking Vercel Configuration"
echo "--------------------------------"

if [ -f "vercel.json" ]; then
    check_pass "vercel.json exists"
    
    if grep -q "buildCommand" vercel.json; then
        check_pass "Build command configured"
    else
        check_warn "Build command not specified in vercel.json"
    fi
    
    if grep -q "headers" vercel.json; then
        check_pass "Security headers configured"
    else
        check_warn "Security headers not configured"
    fi
else
    check_warn "vercel.json not found (optional but recommended)"
fi

if [ -d ".vercel" ]; then
    check_pass ".vercel directory exists (project linked)"
    
    if [ -f ".vercel/project.json" ]; then
        check_pass "Project configuration found"
        check_info "Project ID: $(cat .vercel/project.json | grep projectId | cut -d '"' -f4)"
    fi
else
    check_warn ".vercel directory not found (run 'vercel link' to link project)"
fi

echo ""

# 5. Check GitHub Actions
echo "5. Checking GitHub Actions"
echo "-------------------------"

if [ -d ".github/workflows" ]; then
    check_pass ".github/workflows directory exists"
    
    if [ -f ".github/workflows/vercel-production.yml" ]; then
        check_pass "Production workflow configured"
    else
        check_warn "Production workflow not found"
    fi
    
    if [ -f ".github/workflows/vercel-preview.yml" ]; then
        check_pass "Preview workflow configured"
    else
        check_warn "Preview workflow not found"
    fi
else
    check_warn ".github/workflows directory not found"
fi

echo ""

# 6. Check Git configuration
echo "6. Checking Git Configuration"
echo "-----------------------------"

if [ -d ".git" ]; then
    check_pass "Git repository initialized"
    
    REMOTE=$(git remote -v | grep origin | head -n 1)
    if [ -n "$REMOTE" ]; then
        check_pass "Git remote configured"
        check_info "Remote: $REMOTE"
    else
        check_warn "No git remote configured"
    fi
    
    BRANCH=$(git branch --show-current)
    check_info "Current branch: $BRANCH"
    
    if [ "$BRANCH" = "main" ]; then
        check_pass "On main branch"
    else
        check_info "Not on main branch (deployments trigger from main)"
    fi
else
    check_fail "Not a git repository"
fi

if [ -f ".gitignore" ]; then
    check_pass ".gitignore exists"
    
    if grep -q ".env.local" .gitignore; then
        check_pass ".env.local in .gitignore"
    else
        check_fail ".env.local not in .gitignore (security risk!)"
    fi
    
    if grep -q ".vercel" .gitignore; then
        check_pass ".vercel in .gitignore"
    else
        check_warn ".vercel not in .gitignore"
    fi
else
    check_fail ".gitignore not found"
fi

echo ""

# 7. Check documentation
echo "7. Checking Documentation"
echo "------------------------"

if [ -f "README.md" ]; then
    check_pass "README.md exists"
else
    check_warn "README.md not found"
fi

if [ -f "docs/DEPLOYMENT.md" ]; then
    check_pass "Deployment documentation exists"
else
    check_warn "docs/DEPLOYMENT.md not found"
fi

if [ -f "DEPLOYMENT_CHECKLIST.md" ]; then
    check_pass "Deployment checklist exists"
else
    check_warn "DEPLOYMENT_CHECKLIST.md not found"
fi

echo ""

# 8. Test build
echo "8. Testing Build"
echo "---------------"

if command -v npm &> /dev/null; then
    check_pass "npm is installed"
    
    echo "Running build test..."
    if npm run build > /dev/null 2>&1; then
        check_pass "Build successful"
    else
        check_fail "Build failed (run 'npm run build' for details)"
    fi
else
    check_fail "npm not found"
fi

echo ""

# 9. Check Vercel CLI
echo "9. Checking Vercel CLI"
echo "---------------------"

if command -v vercel &> /dev/null; then
    check_pass "Vercel CLI installed"
    
    VERCEL_VERSION=$(vercel --version)
    check_info "Version: $VERCEL_VERSION"
    
    # Check if logged in
    if vercel whoami > /dev/null 2>&1; then
        VERCEL_USER=$(vercel whoami)
        check_pass "Logged in to Vercel as: $VERCEL_USER"
    else
        check_warn "Not logged in to Vercel (run 'vercel login')"
    fi
else
    check_warn "Vercel CLI not installed (run 'npm install -g vercel')"
fi

echo ""

# 10. Summary
echo "========================================="
echo "Validation Summary"
echo "========================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Your deployment is ready. Next steps:"
    echo "  1. Run 'vercel --prod' to deploy"
    echo "  2. Configure custom domain in Vercel Dashboard"
    echo "  3. Enable Vercel Analytics"
    echo "  4. Set up GitHub Actions secrets"
else
    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}✗ Found $ERRORS error(s)${NC}"
        echo "Please fix the errors before deploying."
    fi
    
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ Found $WARNINGS warning(s)${NC}"
        echo "Warnings are optional but recommended to fix."
    fi
    
    echo ""
    echo "For help, see:"
    echo "  - docs/DEPLOYMENT.md"
    echo "  - DEPLOYMENT_CHECKLIST.md"
fi

echo ""

exit $ERRORS
