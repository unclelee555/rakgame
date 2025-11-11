# Vercel Analytics Setup Guide

This guide explains how to set up and use Vercel Analytics and Speed Insights for RakGame.

## Overview

Vercel provides two analytics products:

1. **Web Analytics** - Track page views, visitors, and traffic sources
2. **Speed Insights** - Monitor real-user performance metrics (Core Web Vitals)

Both are automatically integrated with Next.js applications deployed on Vercel.

## Prerequisites

- RakGame deployed on Vercel
- Vercel account with project access

## Step 1: Enable Web Analytics

### Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your RakGame project
3. Click on the "Analytics" tab
4. Click "Enable Analytics"
5. Choose "Web Analytics" (free tier available)
6. Click "Enable"

### What Gets Tracked

Web Analytics automatically tracks:

- **Page Views** - Total number of page loads
- **Unique Visitors** - Number of unique users
- **Top Pages** - Most visited pages
- **Referrers** - Where traffic comes from
- **Countries** - Geographic distribution
- **Devices** - Desktop vs mobile vs tablet
- **Browsers** - Browser usage statistics
- **Operating Systems** - OS distribution

### Privacy-Friendly

Vercel Analytics is privacy-friendly:
- No cookies required
- GDPR compliant
- No personal data collected
- No IP addresses stored
- No cross-site tracking

## Step 2: Enable Speed Insights

### Via Vercel Dashboard

1. Go to your project in Vercel Dashboard
2. Click on the "Speed Insights" tab
3. Click "Enable Speed Insights"
4. Choose your plan (free tier available)
5. Click "Enable"

### What Gets Measured

Speed Insights tracks Core Web Vitals:

1. **LCP (Largest Contentful Paint)**
   - Measures loading performance
   - Target: < 2.5 seconds
   - Tracks when main content loads

2. **FID (First Input Delay)**
   - Measures interactivity
   - Target: < 100 milliseconds
   - Tracks time to first user interaction

3. **CLS (Cumulative Layout Shift)**
   - Measures visual stability
   - Target: < 0.1
   - Tracks unexpected layout shifts

4. **FCP (First Contentful Paint)**
   - Measures perceived load speed
   - Target: < 1.8 seconds
   - Tracks when first content appears

5. **TTFB (Time to First Byte)**
   - Measures server response time
   - Target: < 600 milliseconds
   - Tracks server performance

## Step 3: View Analytics Data

### Web Analytics Dashboard

Access at: `https://vercel.com/[username]/rakgame/analytics`

**Overview Tab:**
- Total page views (last 24h, 7d, 30d)
- Unique visitors
- Top pages
- Traffic sources

**Audience Tab:**
- Geographic distribution
- Device breakdown
- Browser usage
- Operating systems

**Acquisition Tab:**
- Referrer sources
- Direct traffic
- Social media traffic
- Search engine traffic

### Speed Insights Dashboard

Access at: `https://vercel.com/[username]/rakgame/speed-insights`

**Overview:**
- Core Web Vitals scores
- Performance trends over time
- Device-specific metrics
- Page-specific performance

**Details:**
- Individual page performance
- Slowest pages
- Performance by country
- Performance by device

## Step 4: Integrate Analytics in Code (Optional)

While analytics work automatically, you can add custom tracking:

### Track Custom Events

```typescript
// lib/analytics.ts
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.va) {
    window.va('event', eventName, properties);
  }
}

// Usage in components
import { trackEvent } from '@/lib/analytics';

function GameCard({ game }) {
  const handleAddToCollection = () => {
    trackEvent('game_added', {
      platform: game.platform,
      type: game.type,
      price: game.price
    });
    // ... rest of logic
  };
  
  return (
    <button onClick={handleAddToCollection}>
      Add to Collection
    </button>
  );
}
```

### Track Page Views (Automatic)

Next.js App Router automatically tracks page views. No code needed!

### Track User Properties

```typescript
// Set user properties
if (typeof window !== 'undefined' && window.va) {
  window.va('set', {
    userId: user.id,
    plan: 'free',
    language: user.language
  });
}
```

## Step 5: Set Up Alerts (Optional)

### Performance Alerts

1. Go to Speed Insights dashboard
2. Click "Alerts" tab
3. Set thresholds for Core Web Vitals
4. Choose notification method (email, Slack)

Example alerts:
- LCP > 3 seconds
- FID > 200 milliseconds
- CLS > 0.2

### Traffic Alerts

1. Go to Analytics dashboard
2. Click "Alerts" tab
3. Set traffic thresholds
4. Choose notification method

Example alerts:
- Traffic drops by 50%
- Error rate exceeds 5%
- Unusual traffic spike

## Step 6: Optimize Based on Data

### Analyze Performance Issues

**If LCP is high (> 2.5s):**
- Optimize images (use Next.js Image)
- Reduce bundle size
- Enable caching
- Use CDN for assets

**If FID is high (> 100ms):**
- Reduce JavaScript execution time
- Split large bundles
- Defer non-critical scripts
- Use code splitting

**If CLS is high (> 0.1):**
- Set image dimensions
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use CSS aspect-ratio

### Analyze Traffic Patterns

**High bounce rate on specific pages:**
- Improve page content
- Reduce load time
- Fix broken links
- Improve navigation

**Low engagement:**
- Add more interactive features
- Improve user experience
- Add clear calls-to-action
- Optimize for mobile

## Step 7: Export Analytics Data

### Via Dashboard

1. Go to Analytics dashboard
2. Click "Export" button
3. Choose date range
4. Select format (CSV, JSON)
5. Download data

### Via API (Advanced)

```typescript
// Fetch analytics data via Vercel API
const response = await fetch(
  `https://api.vercel.com/v1/analytics?projectId=${projectId}`,
  {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`
    }
  }
);

const data = await response.json();
```

## Performance Targets for RakGame

Based on requirements (9.5), target metrics:

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| First Contentful Paint | < 1.5s | - | Monitor |
| Time to Interactive | < 3s | - | Monitor |
| Lighthouse Score | > 90 | - | Monitor |
| LCP | < 2.5s | - | Monitor |
| FID | < 100ms | - | Monitor |
| CLS | < 0.1 | - | Monitor |

## Monitoring Checklist

### Daily
- [ ] Check overall traffic trends
- [ ] Review error rates
- [ ] Monitor Core Web Vitals
- [ ] Check for unusual patterns

### Weekly
- [ ] Analyze top pages
- [ ] Review traffic sources
- [ ] Check device distribution
- [ ] Review performance trends

### Monthly
- [ ] Export analytics data
- [ ] Compare month-over-month growth
- [ ] Identify optimization opportunities
- [ ] Review and adjust targets

## Troubleshooting

### Analytics Not Showing Data

**Problem:** No data in analytics dashboard

**Solutions:**
1. Wait 24 hours for data to populate
2. Verify deployment is successful
3. Check that analytics is enabled
4. Visit your site to generate traffic
5. Check browser console for errors

### Speed Insights Not Working

**Problem:** No performance data

**Solutions:**
1. Ensure Speed Insights is enabled
2. Wait for real user data (requires traffic)
3. Check that deployment is on Vercel
4. Verify Next.js version is compatible

### Custom Events Not Tracking

**Problem:** Custom events not appearing

**Solutions:**
1. Check that `window.va` is available
2. Verify event name is valid
3. Check browser console for errors
4. Ensure analytics script loaded

## Privacy and Compliance

### GDPR Compliance

Vercel Analytics is GDPR compliant:
- No cookies used
- No personal data collected
- No consent banner required
- Data stored in EU (if configured)

### Data Retention

- Web Analytics: 90 days (free tier)
- Speed Insights: 90 days (free tier)
- Longer retention available on paid plans

### Data Ownership

- You own all analytics data
- Can export data anytime
- Can delete data on request
- No data sharing with third parties

## Cost and Limits

### Free Tier Includes:

**Web Analytics:**
- Unlimited page views
- 90 days data retention
- All standard metrics
- Basic filtering

**Speed Insights:**
- 100,000 data points/month
- 90 days data retention
- Core Web Vitals
- Basic filtering

### Paid Tiers:

- Extended data retention (1 year+)
- Advanced filtering
- Custom events
- API access
- Priority support

## Best Practices

1. **Monitor regularly** - Check analytics weekly
2. **Set baselines** - Establish normal metrics
3. **Track trends** - Look for patterns over time
4. **Act on insights** - Use data to improve
5. **Test changes** - Measure impact of updates
6. **Share data** - Keep team informed
7. **Set goals** - Define success metrics
8. **Iterate** - Continuously optimize

## Resources

- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Speed Insights Docs](https://vercel.com/docs/speed-insights)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)

## Support

For analytics issues:
- Vercel Support: https://vercel.com/support
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
