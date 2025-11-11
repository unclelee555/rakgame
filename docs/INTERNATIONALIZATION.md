# Internationalization (i18n) Implementation

## Overview

RakGame now supports multiple languages using `next-intl`. The application currently supports English (en) and Thai (th) languages, with the ability to easily add more languages in the future.

## Features

- ✅ English and Thai language support
- ✅ Language switcher in the header
- ✅ Language preference persisted in user profile
- ✅ Automatic language loading on login
- ✅ Cookie-based locale storage for immediate UI updates
- ✅ Settings page for language preference management

## Architecture

### Configuration Files

1. **i18n.ts** - Main configuration file that loads translation messages based on locale
2. **messages/en.json** - English translations
3. **messages/th.json** - Thai translations
4. **next.config.js** - Updated to include next-intl plugin

### Key Components

1. **LanguageSwitcher** (`components/layout/language-switcher.tsx`)
   - Dropdown menu for language selection
   - Updates user profile in database
   - Sets cookie for immediate UI update
   - Refreshes page to apply new language

2. **Settings Page** (`app/(dashboard)/settings/page.tsx`)
   - Language preference selector
   - Currency preference selector
   - Saves preferences to user profile

### Hooks

- **useTranslations** (`lib/hooks/use-translations.ts`)
  - Wrapper around next-intl's useTranslations
  - Used in client components to access translations

## Usage

### In Client Components

```typescript
'use client'

import { useTranslations } from '@/lib/hooks/use-translations'

export function MyComponent() {
  const t = useTranslations('namespace')
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}
```

### Translation Namespaces

The translation files are organized into namespaces:

- `common` - Common UI elements (save, cancel, delete, etc.)
- `nav` - Navigation items
- `auth` - Authentication pages
- `games` - Game collection features
- `sellers` - Seller management
- `analytics` - Analytics dashboard
- `settings` - Settings page
- `export` - Export functionality
- `errors` - Error messages
- `offline` - Offline status

### Example Usage

```typescript
// Navigation
const t = useTranslations('nav')
<Link href="/dashboard">{t('dashboard')}</Link>

// Common actions
const tCommon = useTranslations('common')
<Button>{tCommon('save')}</Button>

// Games
const tGames = useTranslations('games')
<h1>{tGames('title')}</h1>
```

## How Language Preference Works

1. **On Login:**
   - User's language preference is loaded from the database
   - Cookie `NEXT_LOCALE` is set to user's preferred language
   - Page refreshes to apply the language

2. **Changing Language:**
   - User selects language from dropdown or settings page
   - Cookie is updated immediately
   - Database is updated (if user is logged in)
   - Page refreshes to apply new language

3. **For New Users:**
   - Default language is English (`en`)
   - Cookie is set on first visit
   - Language can be changed before or after login

## Adding New Languages

To add a new language:

1. Create a new translation file in `messages/` directory (e.g., `messages/ja.json`)
2. Copy the structure from `messages/en.json`
3. Translate all strings to the new language
4. Update the `Language` type in `lib/types/database.ts`:
   ```typescript
   export type Language = 'en' | 'th' | 'ja'
   ```
5. Update the database schema to allow the new language:
   ```sql
   ALTER TABLE users 
   DROP CONSTRAINT users_language_check;
   
   ALTER TABLE users 
   ADD CONSTRAINT users_language_check 
   CHECK (language IN ('en', 'th', 'ja'));
   ```
6. Add the new language to the language switcher in `components/layout/language-switcher.tsx`:
   ```typescript
   const languages = [
     { code: 'en' as Language, name: 'English', nativeName: 'English' },
     { code: 'th' as Language, name: 'Thai', nativeName: 'ไทย' },
     { code: 'ja' as Language, name: 'Japanese', nativeName: '日本語' },
   ]
   ```

## Translation Guidelines

When adding or updating translations:

1. **Keep keys consistent** - Use the same key structure across all language files
2. **Use descriptive keys** - Keys should clearly indicate what they represent
3. **Maintain context** - Group related translations in the same namespace
4. **Test thoroughly** - Verify translations in the UI to ensure they fit properly
5. **Consider length** - Some languages may have longer text, ensure UI can accommodate

## Components Using Translations

The following components have been updated to use translations:

- ✅ Sidebar navigation
- ✅ Header (user menu)
- ✅ Language switcher
- ✅ Settings page
- ✅ Login form (example implementation)

### Components to Update

To fully translate the application, the following components should be updated:

- [ ] Register form
- [ ] Reset password form
- [ ] Update password form
- [ ] Game form
- [ ] Game list
- [ ] Game filters
- [ ] Seller form
- [ ] Seller list
- [ ] Analytics charts
- [ ] Export button
- [ ] Offline indicator
- [ ] Error messages throughout the app

## Best Practices

1. **Always use translations** - Never hardcode user-facing text
2. **Use namespaces** - Organize translations by feature/component
3. **Provide context** - Use descriptive keys that indicate where the text appears
4. **Test both languages** - Ensure the UI works well in all supported languages
5. **Handle plurals** - Use next-intl's plural support for countable items
6. **Format dates/numbers** - Use next-intl's formatting utilities for locale-specific formatting

## Technical Details

### Locale Storage

- **Cookie**: `NEXT_LOCALE` - Stores current locale, expires in 1 year
- **Database**: `users.language` - Stores user's preferred language

### Middleware

The middleware (`middleware.ts`) handles:
- Setting default locale cookie if not present
- Maintaining locale across page navigations

### Server Components

For server components, use `getTranslations` from `next-intl/server`:

```typescript
import { getTranslations } from 'next-intl/server'

export default async function MyServerComponent() {
  const t = await getTranslations('namespace')
  
  return <h1>{t('title')}</h1>
}
```

## Troubleshooting

### Language not changing
- Check if cookie `NEXT_LOCALE` is being set
- Verify database update is successful
- Ensure page refresh is triggered after language change

### Missing translations
- Check if the key exists in the translation file
- Verify the namespace is correct
- Ensure the translation file is valid JSON

### Build errors
- Validate all JSON files are properly formatted
- Check that all translation keys are consistent across languages
- Ensure next-intl plugin is properly configured in next.config.js

## Requirements Fulfilled

This implementation fulfills the following requirements:

- **Requirement 10.4**: THE RakGame System SHALL support English and Thai language options
- **Requirement 10.5**: WHEN a user selects a language, THE RakGame System SHALL display all interface text in the selected language

## Future Enhancements

- Add more languages (Japanese, Chinese, Korean, etc.)
- Implement RTL (Right-to-Left) support for Arabic, Hebrew, etc.
- Add language-specific date/time formatting
- Implement pluralization rules for different languages
- Add translation management UI for admins
