'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/lib/hooks/use-translations'
import { getRegionDisplay } from '@/lib/constants/regions'
import { Pencil, Trash2, Calendar, DollarSign, Package, MapPin, Copy } from 'lucide-react'
import type { Game } from '@/lib/types/database'

interface GameCardProps {
  game: Game
  onEdit: (game: Game) => void
  onDelete: (id: string) => void
  isDuplicate?: boolean
}

export function GameCard({ game, onEdit, onDelete, isDuplicate = false }: GameCardProps) {
  const t = useTranslations('games')
  const tCommon = useTranslations('common')
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${isDuplicate ? 'border-yellow-500 border-2' : ''}`}>
      {game.image_url && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={game.image_url}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover"
            loading="lazy"
            quality={75}
          />
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1">{game.title}</h3>
          {isDuplicate && (
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 text-xs font-medium bg-yellow-50 dark:bg-yellow-950 px-2 py-1 rounded-md shrink-0">
              <Copy className="h-3 w-3" />
              <span>{t('duplicate')}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>{game.platform} • {game.type}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>{formatPrice(game.price)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(game.purchase_date)}</span>
          </div>
          
          {game.region && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{getRegionDisplay(game.region)}</span>
            </div>
          )}
          
          {game.seller && (
            <div className="text-xs">
              <span className="font-medium">{t('seller')}:</span> {game.seller.name}
            </div>
          )}
          
          {game.condition && (
            <div className="text-xs">
              <span className="font-medium">{t('condition')}:</span> {game.condition}
            </div>
          )}
          
          {game.notes && (
            <p className="text-xs mt-2 line-clamp-2">{game.notes}</p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-h-[44px] touch-manipulation"
          onClick={() => onEdit(game)}
        >
          <Pencil className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{tCommon('edit')}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-h-[44px] touch-manipulation"
          onClick={() => onDelete(game.id)}
        >
          <Trash2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{tCommon('delete')}</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
