'use client'

import { useState } from 'react'
import { Download, FileText, FileJson, FileType } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

type ExportFormat = 'csv' | 'json' | 'pdf'

interface ExportButtonProps {
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExportButton({ 
  disabled = false, 
  variant = 'outline',
  size = 'default'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true)
      toast.loading(`Generating ${format.toUpperCase()} export...`)

      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Export failed')
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : `rakgame-collection.${format}`

      // Download file
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.dismiss()
      toast.success(`Collection exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export error:', error)
      toast.dismiss()
      toast.error(error instanceof Error ? error.message : 'Failed to export collection')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={disabled || isExporting}
          className="min-h-[44px] touch-manipulation"
        >
          <Download className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => handleExport('csv')}
          disabled={isExporting}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('json')}
          disabled={isExporting}
        >
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
        >
          <FileType className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
