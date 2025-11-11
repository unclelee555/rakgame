'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslations } from '@/lib/hooks/use-translations'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import type { Platform, GameType, Condition } from '@/lib/types/database'

export interface GameFilters {
  search: string
  platform: Platform | 'all'
  type: GameType | 'all'
  region: string
  condition: Condition | 'all' | 'any'
  sortBy: 'title' | 'date' | 'price' | 'platform'
  sortOrder: 'asc' | 'desc'
}

interface GameFiltersProps {
  filters: GameFilters
  onFiltersChange: (filters: GameFilters) => void
}

const platforms: Platform[] = [
  'Switch',
  'Switch 2',
  'PS5',
  'PS4',
  'Xbox Series X|S',
  'Xbox One',
  'PC',
  'Other'
]

const regions = ['NA', 'EU', 'JP', 'AS', 'AU', 'Other']

export function GameFiltersComponent({ filters, onFiltersChange }: GameFiltersProps) {
  const t = useTranslations('games')
  const tCommon = useTranslations('common')
  
  const updateFilter = <K extends keyof GameFilters>(
    key: K,
    value: GameFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 bg-card rounded-lg border">
      {/* Search Bar */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm">{tCommon('search')}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder={t('searchByTitle')}
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 min-h-[44px] touch-manipulation"
          />
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Platform Filter */}
        <div className="space-y-2">
          <Label htmlFor="platform" className="text-sm">{t('platform')}</Label>
          <Select
            value={filters.platform}
            onValueChange={(value) => updateFilter('platform', value as Platform | 'all')}
          >
            <SelectTrigger id="platform" className="min-h-[44px] touch-manipulation">
              <SelectValue placeholder={t('allPlatforms')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allPlatforms')}</SelectItem>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm">{t('type')}</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => updateFilter('type', value as GameType | 'all')}
          >
            <SelectTrigger id="type" className="min-h-[44px] touch-manipulation">
              <SelectValue placeholder={t('allTypes')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allTypes')}</SelectItem>
              <SelectItem value="Disc">{t('disc')}</SelectItem>
              <SelectItem value="Digital">{t('digital')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Region Filter */}
        <div className="space-y-2">
          <Label htmlFor="region" className="text-sm">{t('region')}</Label>
          <Select
            value={filters.region}
            onValueChange={(value) => updateFilter('region', value)}
          >
            <SelectTrigger id="region" className="min-h-[44px] touch-manipulation">
              <SelectValue placeholder={t('allRegions')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allRegions')}</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Condition Filter */}
        <div className="space-y-2">
          <Label htmlFor="condition" className="text-sm">{t('condition')}</Label>
          <Select
            value={filters.condition}
            onValueChange={(value) => updateFilter('condition', value as Condition | 'all' | 'any')}
          >
            <SelectTrigger id="condition" className="min-h-[44px] touch-manipulation">
              <SelectValue placeholder={t('allConditions')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allConditions')}</SelectItem>
              <SelectItem value="New">{t('new')}</SelectItem>
              <SelectItem value="Used">{t('used')}</SelectItem>
              <SelectItem value="any">{t('notSpecified')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="sortBy" className="text-sm">{t('sortBy')}</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter('sortBy', value as GameFilters['sortBy'])}
          >
            <SelectTrigger id="sortBy" className="min-h-[44px] touch-manipulation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">{t('sortByTitle')}</SelectItem>
              <SelectItem value="date">{t('sortByDate')}</SelectItem>
              <SelectItem value="price">{t('sortByPrice')}</SelectItem>
              <SelectItem value="platform">{t('sortByPlatform')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder" className="text-sm">{t('sortOrder')}</Label>
          <Select
            value={filters.sortOrder}
            onValueChange={(value) => updateFilter('sortOrder', value as 'asc' | 'desc')}
          >
            <SelectTrigger id="sortOrder" className="min-h-[44px] touch-manipulation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{t('ascending')}</SelectItem>
              <SelectItem value="desc">{t('descending')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
