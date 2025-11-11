# Export Functionality

## Overview

The RakGame export functionality allows users to export their game collection data in three formats: CSV, JSON, and PDF. Each export includes metadata such as timestamp, user email, and total game count.

## Features

### Export Formats

1. **CSV Export**
   - Includes all game fields in spreadsheet format
   - Contains metadata header with export date, user email, total games, and currency
   - Properly escapes special characters (commas, quotes, newlines)
   - Compatible with Excel, Google Sheets, and other spreadsheet applications

2. **JSON Export**
   - Complete structured data export
   - Includes nested seller information
   - Contains comprehensive metadata object
   - Ideal for data backup and programmatic processing

3. **PDF Export**
   - Formatted collection summary with visual table
   - Includes metadata and total spending calculation
   - Optimized column widths for readability
   - Professional document suitable for printing or sharing

### Export Metadata

All exports include the following metadata:
- Export timestamp (ISO 8601 format)
- User email address
- User ID
- Total number of games
- User's preferred currency

### Performance

- Handles collections up to 1000 games efficiently
- Server-side generation for optimal performance
- Streaming download for large files
- No client-side memory constraints

## Usage

### In the UI

The export button is available in two locations:

1. **Collection Page** (`/collection`)
   - Located in the top-right corner next to "Add Game" button
   - Disabled when collection is empty

2. **Analytics Page** (`/analytics`)
   - Located in the top-right corner
   - Disabled when collection is empty

### Export Process

1. Click the "Export" button
2. Select desired format from dropdown menu:
   - Export as CSV
   - Export as JSON
   - Export as PDF
3. File is generated and automatically downloaded
4. Filename format: `rakgame-collection-YYYY-MM-DD.{format}`

## Technical Implementation

### Components

- **ExportButton** (`components/export-button.tsx`)
  - Dropdown menu with format selection
  - Loading states during export generation
  - Toast notifications for success/error feedback

### API Route

- **POST /api/export** (`app/api/export/route.ts`)
  - Requires authentication
  - Accepts format parameter: 'csv', 'json', or 'pdf'
  - Fetches user games with seller information
  - Generates export file server-side
  - Returns file as download with appropriate headers

### Utilities

- **Export Utils** (`lib/utils/export.ts`)
  - `generateCSV()` - Creates CSV string with proper escaping
  - `generateJSON()` - Creates formatted JSON structure
  - `generatePDF()` - Generates PDF using jsPDF and autoTable
  - Helper functions for metadata and filename generation

### Dependencies

- `jspdf` - PDF generation library
- `jspdf-autotable` - Table plugin for jsPDF

## Data Structure

### CSV Format

```csv
Export Date,2024-11-10T12:00:00.000Z
User Email,user@example.com
Total Games,50
Currency,THB

Title,Platform,Type,Price,Purchase Date,Region,Condition,Seller,Notes,Created At
"The Legend of Zelda",Switch,Disc,1990.00,2024-01-15,US,New,GameStop,"Great game",2024-01-15T10:00:00.000Z
```

### JSON Format

```json
{
  "metadata": {
    "exportDate": "2024-11-10T12:00:00.000Z",
    "userEmail": "user@example.com",
    "userId": "uuid",
    "totalGames": 50,
    "currency": "THB"
  },
  "games": [
    {
      "id": "uuid",
      "title": "The Legend of Zelda",
      "platform": "Switch",
      "type": "Disc",
      "price": 1990.00,
      "purchaseDate": "2024-01-15",
      "region": "US",
      "condition": "New",
      "notes": "Great game",
      "imageUrl": "https://...",
      "seller": {
        "id": "uuid",
        "name": "GameStop",
        "url": "https://gamestop.com",
        "note": "Local store"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### PDF Format

The PDF includes:
- Header with "Game Collection Export" title
- Metadata section with export date, user email, total games, currency, and total spending
- Table with columns: Title, Platform, Type, Price, Date, Seller, Condition
- Automatic page breaks for large collections
- Professional styling with gray headers

## Error Handling

The export system handles various error scenarios:

- **Authentication errors**: Returns 401 if user is not authenticated
- **Invalid format**: Returns 400 if format is not csv, json, or pdf
- **Database errors**: Returns 500 with error message
- **Client-side errors**: Displays toast notification with error details

## Security

- All exports require authentication
- Row Level Security ensures users can only export their own data
- No sensitive data (passwords, tokens) included in exports
- Export generation happens server-side to prevent data tampering

## Future Enhancements

Potential improvements for future versions:

1. **Filtered Exports**: Export only filtered/searched games
2. **Custom Fields**: Allow users to select which fields to include
3. **Email Export**: Send export file via email
4. **Scheduled Exports**: Automatic periodic backups
5. **Import Functionality**: Import games from CSV/JSON files
6. **Excel Format**: Native .xlsx export with formatting
7. **Cloud Storage**: Save exports to Google Drive, Dropbox, etc.
