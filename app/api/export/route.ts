import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCSV, generateJSON, generatePDF, type ExportMetadata } from '@/lib/utils/export'
import type { Game } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get format from request body
    const body = await request.json()
    const { format } = body as { format: 'csv' | 'json' | 'pdf' }

    if (!format || !['csv', 'json', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be csv, json, or pdf' },
        { status: 400 }
      )
    }

    // Fetch user profile for currency
    const { data: profile } = await supabase
      .from('users')
      .select('email, currency')
      .eq('id', user.id)
      .single()

    // Fetch all games with seller information
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select(`
        *,
        seller:sellers(*)
      `)
      .order('purchase_date', { ascending: false })
      .limit(1000) // Handle up to 1000 entries

    if (gamesError) {
      throw gamesError
    }

    // Prepare metadata
    const metadata: ExportMetadata = {
      timestamp: new Date().toISOString(),
      userEmail: profile?.email || user.email || 'unknown',
      userId: user.id,
      totalGames: games?.length || 0,
      currency: profile?.currency || 'THB'
    }

    // Generate export based on format
    let content: BodyInit
    let mimeType: string
    let filename: string

    const timestamp = new Date().toISOString().split('T')[0]

    switch (format) {
      case 'csv':
        content = generateCSV(games as Game[], metadata)
        mimeType = 'text/csv'
        filename = `rakgame-collection-${timestamp}.csv`
        break

      case 'json':
        content = generateJSON(games as Game[], metadata)
        mimeType = 'application/json'
        filename = `rakgame-collection-${timestamp}.json`
        break

      case 'pdf':
        const pdf = generatePDF(games as Game[], metadata)
        const pdfOutput = pdf.output('arraybuffer')
        content = new Uint8Array(pdfOutput)
        mimeType = 'application/pdf'
        filename = `rakgame-collection-${timestamp}.pdf`
        break

      default:
        return NextResponse.json(
          { error: 'Invalid format' },
          { status: 400 }
        )
    }

    // Return file as download
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    )
  }
}
