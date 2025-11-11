export interface Region {
  code: string
  name: string
  flag: string
  popular: boolean
}

export const REGIONS: Region[] = [
  // Popular gaming regions (shown first)
  { code: 'Thailand', name: 'Thailand', flag: '🇹🇭', popular: true },
  { code: 'Asia', name: 'Asia', flag: '🌏', popular: true },
  { code: 'North America', name: 'North America', flag: '🌎', popular: true },
  { code: 'Europe', name: 'Europe', flag: '🇪🇺', popular: true },
  { code: 'Japan', name: 'Japan', flag: '🇯🇵', popular: true },
  { code: 'Australia', name: 'Australia', flag: '🇦🇺', popular: true },
  { code: 'Turkey', name: 'Turkey', flag: '🇹🇷', popular: true },
  
  // Other regions (alphabetically)
  { code: 'Argentina', name: 'Argentina', flag: '🇦🇷', popular: false },
  { code: 'Austria', name: 'Austria', flag: '🇦🇹', popular: false },
  { code: 'Belgium', name: 'Belgium', flag: '🇧🇪', popular: false },
  { code: 'Brazil', name: 'Brazil', flag: '🇧🇷', popular: false },
  { code: 'Canada', name: 'Canada', flag: '🇨🇦', popular: false },
  { code: 'Chile', name: 'Chile', flag: '🇨🇱', popular: false },
  { code: 'China', name: 'China', flag: '🇨🇳', popular: false },
  { code: 'Colombia', name: 'Colombia', flag: '🇨🇴', popular: false },
  { code: 'Czech Republic', name: 'Czech Republic', flag: '🇨🇿', popular: false },
  { code: 'Denmark', name: 'Denmark', flag: '🇩🇰', popular: false },
  { code: 'Finland', name: 'Finland', flag: '🇫🇮', popular: false },
  { code: 'France', name: 'France', flag: '🇫🇷', popular: false },
  { code: 'Germany', name: 'Germany', flag: '🇩🇪', popular: false },
  { code: 'Greece', name: 'Greece', flag: '🇬🇷', popular: false },
  { code: 'Hong Kong', name: 'Hong Kong', flag: '🇭🇰', popular: false },
  { code: 'Hungary', name: 'Hungary', flag: '🇭🇺', popular: false },
  { code: 'India', name: 'India', flag: '🇮🇳', popular: false },
  { code: 'Indonesia', name: 'Indonesia', flag: '🇮🇩', popular: false },
  { code: 'Ireland', name: 'Ireland', flag: '🇮🇪', popular: false },
  { code: 'Israel', name: 'Israel', flag: '🇮🇱', popular: false },
  { code: 'Italy', name: 'Italy', flag: '🇮🇹', popular: false },
  { code: 'Malaysia', name: 'Malaysia', flag: '🇲🇾', popular: false },
  { code: 'Mexico', name: 'Mexico', flag: '🇲🇽', popular: false },
  { code: 'Netherlands', name: 'Netherlands', flag: '🇳🇱', popular: false },
  { code: 'New Zealand', name: 'New Zealand', flag: '🇳🇿', popular: false },
  { code: 'Norway', name: 'Norway', flag: '🇳🇴', popular: false },
  { code: 'Philippines', name: 'Philippines', flag: '🇵🇭', popular: false },
  { code: 'Poland', name: 'Poland', flag: '🇵🇱', popular: false },
  { code: 'Portugal', name: 'Portugal', flag: '🇵🇹', popular: false },
  { code: 'Romania', name: 'Romania', flag: '🇷🇴', popular: false },
  { code: 'Russia', name: 'Russia', flag: '🇷🇺', popular: false },
  { code: 'Saudi Arabia', name: 'Saudi Arabia', flag: '🇸🇦', popular: false },
  { code: 'Singapore', name: 'Singapore', flag: '🇸🇬', popular: false },
  { code: 'South Africa', name: 'South Africa', flag: '🇿🇦', popular: false },
  { code: 'South Korea', name: 'South Korea', flag: '🇰🇷', popular: false },
  { code: 'Spain', name: 'Spain', flag: '🇪🇸', popular: false },
  { code: 'Sweden', name: 'Sweden', flag: '🇸🇪', popular: false },
  { code: 'Switzerland', name: 'Switzerland', flag: '🇨🇭', popular: false },
  { code: 'Taiwan', name: 'Taiwan', flag: '🇹🇼', popular: false },
  { code: 'United Arab Emirates', name: 'United Arab Emirates', flag: '🇦🇪', popular: false },
  { code: 'United Kingdom', name: 'United Kingdom', flag: '🇬🇧', popular: false },
  { code: 'United States', name: 'United States', flag: '🇺🇸', popular: false },
  { code: 'Vietnam', name: 'Vietnam', flag: '🇻🇳', popular: false },
]

export const POPULAR_REGIONS = REGIONS.filter(r => r.popular)
export const OTHER_REGIONS = REGIONS.filter(r => !r.popular)

export function getRegionByCode(code: string): Region | undefined {
  return REGIONS.find(r => r.code === code)
}

export function getRegionDisplay(code: string): string {
  const region = getRegionByCode(code)
  return region ? `${region.flag} ${region.name}` : code
}
