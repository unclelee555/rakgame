import type { Game, Currency } from '@/lib/types/database'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface ExportMetadata {
  timestamp: string
  userEmail: string
  userId: string
  totalGames: number
  currency: Currency
}

/**
 * Generate CSV export of game collection
 */
export function generateCSV(games: Game[], metadata: ExportMetadata): string {
  const headers = [
    'Title',
    'Platform',
    'Type',
    'Price',
    'Purchase Date',
    'Region',
    'Condition',
    'Seller',
    'Notes',
    'Created At'
  ]

  const rows = games.map(game => [
    escapeCSV(game.title),
    escapeCSV(game.platform),
    escapeCSV(game.type),
    game.price.toString(),
    game.purchase_date,
    escapeCSV(game.region || ''),
    escapeCSV(game.condition || ''),
    escapeCSV(game.seller?.name || ''),
    escapeCSV(game.notes || ''),
    game.created_at
  ])

  // Add metadata header
  const metadataRows = [
    ['Export Date', metadata.timestamp],
    ['User Email', metadata.userEmail],
    ['Total Games', metadata.totalGames.toString()],
    ['Currency', metadata.currency],
    ['']
  ]

  const csvContent = [
    ...metadataRows.map(row => row.join(',')),
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

/**
 * Escape CSV special characters
 */
function escapeCSV(value: string): string {
  if (!value) return ''
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  
  return value
}

/**
 * Generate JSON export of game collection
 */
export function generateJSON(games: Game[], metadata: ExportMetadata): string {
  const exportData = {
    metadata: {
      exportDate: metadata.timestamp,
      userEmail: metadata.userEmail,
      userId: metadata.userId,
      totalGames: metadata.totalGames,
      currency: metadata.currency
    },
    games: games.map(game => ({
      id: game.id,
      title: game.title,
      platform: game.platform,
      type: game.type,
      price: game.price,
      purchaseDate: game.purchase_date,
      region: game.region,
      condition: game.condition,
      notes: game.notes,
      imageUrl: game.image_url,
      seller: game.seller ? {
        id: game.seller.id,
        name: game.seller.name,
        url: game.seller.url,
        note: game.seller.note
      } : null,
      createdAt: game.created_at
    }))
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Generate PDF export of game collection
 */
export function generatePDF(games: Game[], metadata: ExportMetadata): jsPDF {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text('Game Collection Export', 14, 20)
  
  // Add metadata
  doc.setFontSize(10)
  doc.text(`Export Date: ${new Date(metadata.timestamp).toLocaleString()}`, 14, 30)
  doc.text(`User: ${metadata.userEmail}`, 14, 36)
  doc.text(`Total Games: ${metadata.totalGames}`, 14, 42)
  doc.text(`Currency: ${metadata.currency}`, 14, 48)
  
  // Calculate total spending
  const totalSpending = games.reduce((sum, game) => sum + game.price, 0)
  doc.text(`Total Spending: ${totalSpending.toFixed(2)} ${metadata.currency}`, 14, 54)
  
  // Add table
  const tableData = games.map(game => [
    game.title,
    game.platform,
    game.type,
    `${game.price.toFixed(2)}`,
    game.purchase_date,
    game.seller?.name || '-',
    game.condition || '-'
  ])
  
  autoTable(doc, {
    head: [['Title', 'Platform', 'Type', 'Price', 'Date', 'Seller', 'Condition']],
    body: tableData,
    startY: 60,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 66, 66] },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 },
      6: { cellWidth: 20 }
    }
  })
  
  return doc
}

/**
 * Download file to user's device
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(format: 'csv' | 'json' | 'pdf'): string {
  const timestamp = new Date().toISOString().split('T')[0]
  return `rakgame-collection-${timestamp}.${format}`
}
