#!/bin/bash

# RakGame Deployment Pre-flight Check Script
# This script verifies that the application is ready for deployment

set -e

echo "🚀 RakGame Deployment Pre-flight Check"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counter
CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "1. Checking Node.js and npm..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js installed: $NODE_VERSION"
else
    error "Node.js not found. Please install Node.js 18+"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    success "npm installed: $NPM_VERSION"
else
    error "npm not found"
fi

echo ""
echo "2. Checking dependencies..."
if [ -d "node_modules" ]; then
    success "node_modules directory exists"
else
    warning "node_modules not found. Run 'npm install'"
fi

if [ -f "package-lock.json" ]; then
    success "package-lock.json exists"
else
    warning "package-lock.json not found"
fi

echo ""
echo "3. Checking environment configuration..."
if [ -f ".env.local.example" ]; then
    success ".env.local.example exists"
else
    error ".env.local.example not found"
fi

if [ -f ".env.local" ]; then
    success ".env.local exists (for local development)"
    
    # Check for required variables
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        success "NEXT_PUBLIC_SUPABASE_URL found in .env.local"
    else
        error "NEXT_PUBLIC_SUPABASE_URL missing in .env.local"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        success "NEXT_PUBLIC_SUPABASE_ANON_KEY found in .env.local"
    else
        error "NEXT_PUBLIC_SUPABASE_ANON_KEY missing in .env.local"
    fi
else
    warning ".env.local not found (OK for production, needed for local dev)"
fi

echo ""
echo "4. Checking configuration files..."
if [ -f "next.config.js" ]; then
    success "next.config.js exists"
else
    error "next.config.js not found"
fi

if [ -f "vercel.json" ]; then
    success "vercel.json exists"
else
    warning "vercel.json not found (optional)"
fi

if [ -f "tsconfig.json" ]; then
    success "tsconfig.json exists"
else
    error "tsconfig.json not found"
fi

echo ""
echo "5. Checking Git status..."
if command -v git &> /dev/null; then
    if [ -d ".git" ]; then
        success "Git repository initialized"
        
        # Check for uncommitted changes
        if [ -z "$(git status --porcelain)" ]; then
            success "No uncommitted changes"
        else
            warning "Uncommitted changes detected. Commit before deploying."
        fi
        
        # Check current branch
        CURRENT_BRANCH=$(git branch --show-current)
        if [ "$CURRENT_BRANCH" = "main" ]; then
            success "On main branch"
        else
            warning "Not on main branch (current: $CURRENT_BRANCH)"
        fi
    else
        error "Not a Git repository"
    fi
else
    error "Git not installed"
fi

echo ""
echo "6. Running build test..."
if npm run build > /dev/null 2>&1; then
    success "Build successful"
else
    error "Build failed. Run 'npm run build' to see errors"
fi

echo ""
echo "7. Checking for common issues..."

# Check for console.log statements (excluding allowed ones)
if grep -r "console\.log" app/ components/ lib/ --include="*.ts" --include="*.tsx" | grep -v "console.error" | grep -v "console.warn" > /dev/null 2>&1; then
    warning "console.log statements found (will be removed in production)"
else
    success "No console.log statements found"
fi

# Check for TODO comments
TODO_COUNT=$(grep -r "TODO" app/ components/ lib/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l || echo "0")
if [ "$TODO_COUNT" -gt 0 ]; then
    warning "$TODO_COUNT TODO comments found"
else
    success "No TODO comments found"
fi

# Check for hardcoded secrets
if grep -r "supabase\.co" app/ components/ lib/ --include="*.ts" --include="*.tsx" | grep -v "NEXT_PUBLIC" > /dev/null 2>&1; then
    error "Potential hardcoded Supabase URL found"
else
    success "No hardcoded secrets detected"
fi

echo ""
echo "8. Checking documentation..."
if [ -f "README.md" ]; then
    success "README.md exists"
else
    error "README.md not found"
fi

if [ -f "docs/DEPLOYMENT.md" ]; then
    success "DEPLOYMENT.md exists"
else
    warning "DEPLOYMENT.md not found"
fi

if [ -f "DEPLOYMENT_CHECKLIST.md" ]; then
    success "DEPLOYMENT_CHECKLIST.md exists"
else
    warning "DEPLOYMENT_CHECKLIST.md not found"
fi

echo ""
echo "======================================"
echo "Pre-flight Check Complete"
echo "======================================"
echo -e "${GREEN}Checks passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Checks failed: $CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ Ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Push your code to GitHub"
    echo "2. Connect repository to Vercel"
    echo "3. Configure environment variables in Vercel"
    echo "4. Deploy!"
    echo ""
    echo "See DEPLOYMENT.md for detailed instructions."
    exit 0
else
    echo -e "${RED}✗ Please fix the errors before deploying${NC}"
    exit 1
fi
