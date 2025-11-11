'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useTranslations } from '@/lib/hooks/use-translations'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DuplicateWarningDialog } from './duplicate-warning-dialog'
import { findDuplicates } from '@/lib/utils/duplicate-detection'
import { POPULAR_REGIONS, OTHER_REGIONS } from '@/lib/constants/regions'
import type { Game, Seller, Platform, GameType, Condition } from '@/lib/types/database'
import { Upload, X } from 'lucide-react'

interface GameFormProps {
  game?: Game
  sellers: Seller[]
  allGames: Game[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Omit<Game, 'id' | 'user_id' | 'created_at' | 'seller'>, imageFile?: File) => Promise<void>
  onCreateSeller: (data: { name: string; url?: string; note?: string }) => Promise<Seller | undefined>
}

const platforms: Platform[] = ['Switch', 'Switch 2', 'PS5', 'PS4', 'Xbox Series X|S', 'Xbox One', 'PC', 'Other']
const gameTypes: GameType[] = ['Disc', 'Digital']
const conditions: Condition[] = ['New', 'Used']

export function GameForm({ game, sellers, allGames, open, onOpenChange, onSubmit, onCreateSeller }: GameFormProps) {
  const t = useTranslations('games')
  const tCommon = useTranslations('common')
  const tSellers = useTranslations('sellers')
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  
  const [title, setTitle] = useState(game?.title || '')
  const [platform, setPlatform] = useState<Platform | ''>(game?.platform || '')
  const [type, setType] = useState<GameType | ''>(game?.type || 'Disc')
  const [price, setPrice] = useState(game?.price?.toString() || '')
  const [purchaseDate, setPurchaseDate] = useState(game?.purchase_date || getTodayDate())
  const [sellerId, setSellerId] = useState<string>(game?.seller_id || '')
  const [region, setRegion] = useState(game?.region || 'Thailand')
  const [condition, setCondition] = useState<Condition | ''>(game?.condition || 'New')
  const [notes, setNotes] = useState(game?.notes || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(game?.image_url || null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [duplicateWarningOpen, setDuplicateWarningOpen] = useState(false)
  const [pendingSubmit, setPendingSubmit] = useState(false)
  
  // Quick add seller state
  const [showQuickAddSeller, setShowQuickAddSeller] = useState(false)
  const [newSellerName, setNewSellerName] = useState('')
  const [newSellerUrl, setNewSellerUrl] = useState('')
  const [addingNewSeller, setAddingNewSeller] = useState(false)
  const [sellerError, setSellerError] = useState('')

  useEffect(() => {
    if (game) {
      setTitle(game.title)
      setPlatform(game.platform)
      setType(game.type)
      setPrice(game.price.toString())
      setPurchaseDate(game.purchase_date)
      setSellerId(game.seller_id || '')
      setRegion(game.region || '')
      setCondition(game.condition || '')
      setNotes(game.notes || '')
      setImagePreview(game.image_url || null)
      setImageFile(null)
    } else {
      resetForm()
    }
  }, [game, open])

  const resetForm = () => {
    setTitle('')
    setPlatform('')
    setType('Disc')
    setPrice('')
    setPurchaseDate(getTodayDate())
    setSellerId('')
    setRegion('Thailand')
    setCondition('New')
    setNotes('')
    setImageFile(null)
    setImagePreview(null)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = t('titleRequired')
    }

    if (!platform) {
      newErrors.platform = t('platformRequired')
    }

    if (!type) {
      newErrors.type = t('typeRequired')
    }

    if (!price.trim()) {
      newErrors.price = t('priceRequired')
    } else {
      const priceNum = parseFloat(price)
      if (isNaN(priceNum) || priceNum < 0) {
        newErrors.price = t('priceInvalid')
      }
    }

    if (!purchaseDate) {
      newErrors.purchaseDate = t('purchaseDateRequired')
    }

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      newErrors.image = t('imageTooBig')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: t('imageTooBig') }))
        return
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: t('imageMustBeImage') }))
        return
      }

      setImageFile(file)
      setErrors(prev => {
        const { image, ...rest } = prev
        return rest
      })

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Check for duplicates only when adding a new game (not editing)
    if (!game && title && platform) {
      const duplicates = findDuplicates(title, platform as Platform, allGames)
      
      if (duplicates.length > 0) {
        // Show duplicate warning dialog
        setDuplicateWarningOpen(true)
        setPendingSubmit(true)
        return
      }
    }

    await performSubmit()
  }

  const performSubmit = async () => {
    setLoading(true)
    try {
      await onSubmit(
        {
          title: title.trim(),
          platform: platform as Platform,
          type: type as GameType,
          price: parseFloat(price),
          purchase_date: purchaseDate,
          seller_id: sellerId || null,
          region: region.trim() || undefined,
          condition: condition || undefined,
          notes: notes.trim() || undefined,
          image_url: imagePreview || undefined,
        },
        imageFile || undefined
      )
      
      resetForm()
      setPendingSubmit(false)
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicateProceed = async () => {
    setDuplicateWarningOpen(false)
    await performSubmit()
  }

  const handleDuplicateCancel = () => {
    setDuplicateWarningOpen(false)
    setPendingSubmit(false)
  }

  const handleQuickAddSeller = async () => {
    if (!newSellerName.trim()) {
      setSellerError(tSellers('sellerNameRequired'))
      return
    }

    setAddingNewSeller(true)
    setSellerError('')
    
    try {
      const newSeller = await onCreateSeller({
        name: newSellerName.trim(),
        url: newSellerUrl.trim() || undefined,
      })
      
      if (newSeller) {
        setSellerId(newSeller.id)
        setShowQuickAddSeller(false)
        setNewSellerName('')
        setNewSellerUrl('')
      }
    } catch (error) {
      setSellerError('Failed to create seller')
    } finally {
      setAddingNewSeller(false)
    }
  }

  const handleSellerChange = (value: string) => {
    if (value === 'add-new') {
      setShowQuickAddSeller(true)
    } else {
      setSellerId(value === 'none' ? '' : value)
    }
  }

  const handleCancel = () => {
    if (game) {
      setTitle(game.title)
      setPlatform(game.platform)
      setType(game.type)
      setPrice(game.price.toString())
      setPurchaseDate(game.purchase_date)
      setSellerId(game.seller_id || '')
      setRegion(game.region || '')
      setCondition(game.condition || '')
      setNotes(game.notes || '')
      setImagePreview(game.image_url || null)
      setImageFile(null)
    } else {
      resetForm()
    }
    setErrors({})
    onOpenChange(false)
  }

  const duplicates = title && platform 
    ? findDuplicates(title, platform as Platform, allGames, game?.id)
    : []

  return (
    <>
      <DuplicateWarningDialog
        open={duplicateWarningOpen}
        onOpenChange={setDuplicateWarningOpen}
        duplicates={duplicates}
        newGameTitle={title}
        newGamePlatform={platform}
        onProceed={handleDuplicateProceed}
        onCancel={handleDuplicateCancel}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] sm:w-full">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{game ? t('editGame') : t('addNewGame')}</DialogTitle>
            <DialogDescription>
              {game 
                ? t('updateGameInfo') 
                : t('addGameToCollection')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                {t('gameTitle')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('titlePlaceholder')}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="platform">
                  {t('platform')} <span className="text-destructive">*</span>
                </Label>
                <Select value={platform} onValueChange={(value) => setPlatform(value as Platform)}>
                  <SelectTrigger className={errors.platform ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('selectPlatform')} />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.platform && (
                  <p className="text-sm text-destructive">{errors.platform}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">
                  {t('type')} <span className="text-destructive">*</span>
                </Label>
                <Select value={type} onValueChange={(value) => setType(value as GameType)}>
                  <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                    <SelectValue placeholder={t('selectType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {gameTypes.map((gameType) => (
                      <SelectItem key={gameType} value={gameType}>
                        {gameType === 'Disc' ? t('disc') : t('digital')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">
                  {t('price')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={t('pricePlaceholder')}
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">
                  {t('purchaseDate')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className={errors.purchaseDate ? 'border-destructive' : ''}
                />
                {errors.purchaseDate && (
                  <p className="text-sm text-destructive">{errors.purchaseDate}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="seller">{t('seller')}</Label>
              <Select value={sellerId || 'none'} onValueChange={handleSellerChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectSeller')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add-new" className="text-blue-600 dark:text-blue-400 font-medium">
                    {tSellers('addNewSeller')}
                  </SelectItem>
                  <SelectItem value="none">{t('none')}</SelectItem>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="region">{t('region')}</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectRegion')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {/* Popular Regions */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {t('popularRegions')}
                    </div>
                    {POPULAR_REGIONS.map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.flag} {r.name}
                      </SelectItem>
                    ))}
                    
                    {/* Other Regions */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1 pt-2">
                      {t('otherRegions')}
                    </div>
                    {OTHER_REGIONS.map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.flag} {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="condition">{t('condition')}</Label>
                <Select value={condition} onValueChange={(value) => setCondition(value as Condition)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCondition')} />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c === 'New' ? t('new') : t('used')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">{t('coverImage')}</Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Game cover preview"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-sm text-muted-foreground">
                      {t('uploadImage')}
                    </span>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              )}
              {errors.image && (
                <p className="text-sm text-destructive">{errors.image}</p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto min-h-[44px] touch-manipulation"
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto min-h-[44px] touch-manipulation">
              {loading ? t('saving') : game ? t('update') : t('addGame')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
      {/* Quick Add Seller Dialog */}
      <Dialog open={showQuickAddSeller} onOpenChange={setShowQuickAddSeller}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{tSellers('quickAddSeller')}</DialogTitle>
            <DialogDescription>
              {tSellers('quickAddDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newSellerName">
                {tSellers('sellerName')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="newSellerName"
                value={newSellerName}
                onChange={(e) => setNewSellerName(e.target.value)}
                placeholder="e.g., GameStop, Amazon"
                className={sellerError ? 'border-destructive' : ''}
              />
              {sellerError && (
                <p className="text-sm text-destructive">{sellerError}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newSellerUrl">{tSellers('url')}</Label>
              <Input
                id="newSellerUrl"
                value={newSellerUrl}
                onChange={(e) => setNewSellerUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowQuickAddSeller(false)
                setNewSellerName('')
                setNewSellerUrl('')
                setSellerError('')
              }}
              disabled={addingNewSeller}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleQuickAddSeller}
              disabled={addingNewSeller}
            >
              {addingNewSeller ? tCommon('loading') : tSellers('saveAndSelect')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
