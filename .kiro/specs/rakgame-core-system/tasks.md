# Implementation Plan

- [x] 1. Initialize Next.js project and configure Supabase
  - Create Next.js 14+ project with TypeScript and App Router
  - Install and configure TailwindCSS
  - Set up Supabase client configuration for both client and server components
  - Configure environment variables for Supabase URL and keys
  - _Requirements: 1.3, 7.1_

- [x] 2. Set up database schema and Row Level Security
  - Create users table with currency and language fields
  - Create sellers table with user relationship
  - Create games table with user and seller relationships
  - Implement Row Level Security policies for all tables
  - Create database indexes for performance optimization
  - _Requirements: 1.1, 1.2, 2.1, 3.1, 7.1_

- [x] 3. Implement authentication system
  - Create login page with email/password form
  - Create registration page with email/password validation
  - Implement password reset flow
  - Create authentication middleware for protected routes
  - Set up session management with automatic refresh
  - Create user profile initialization on registration
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Build core UI components and layout
  - Set up Shadcn/ui component library
  - Create reusable UI components (Button, Card, Dialog, Form, Input, Select, Table)
  - Implement responsive sidebar navigation
  - Create header with user menu and theme toggle
  - Implement dark/light theme switching with persistence
  - Create loading states and error boundaries
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3_

- [x] 5. Implement seller management features
  - Create seller list view with alphabetical sorting
  - Build seller form component with validation (name, URL, note)
  - Implement create seller functionality
  - Implement edit seller functionality
  - Implement delete seller with soft delete handling
  - Create seller selection dropdown for game forms
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Implement game collection CRUD operations
  - Create game list view with card layout
  - Build game form component with all fields (title, platform, type, price, date, region, condition, notes)
  - Implement form validation using Zod schema
  - Implement create game functionality with seller association
  - Implement edit game functionality
  - Implement delete game with confirmation dialog
  - Add image upload functionality with 5MB limit
  - Store images in Supabase Storage
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 7. Build search and filter functionality
  - Create search bar component with real-time text search
  - Implement platform filter dropdown
  - Implement type filter (Disc/Digital)
  - Implement region filter
  - Implement condition filter
  - Add multi-filter support with combined criteria
  - Implement sorting by title, date, price, and platform
  - Display "no results" message when filters return empty
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Implement duplicate detection system
  - Create duplicate checking logic (case-insensitive title + platform match)
  - Display warning dialog when potential duplicate detected
  - Show existing game details in warning
  - Allow user to proceed after acknowledging warning
  - Add visual indicator for duplicate entries in collection view
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 9. Build spending analytics dashboard
  - Create analytics data aggregation functions
  - Calculate total spending across all games
  - Implement spending breakdown by platform
  - Implement spending breakdown by seller
  - Calculate spending trends by month and year
  - Create bar chart component for platform spending using Nivo
  - Create pie chart component for seller distribution using Nivo
  - Create line chart for spending trends over time using Nivo
  - Implement real-time analytics updates on data changes
  - Display analytics in user's preferred currency
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Implement data export functionality
  - Create export utility functions for CSV format
  - Create export utility functions for JSON format
  - Create export utility functions for PDF format
  - Add export timestamp and user identifier to all exports
  - Create export button component with format selection
  - Implement API route for export generation
  - Handle large collections (up to 1000 entries) efficiently
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 11. Implement cloud synchronization
  - Set up Supabase real-time subscriptions for game updates
  - Implement optimistic UI updates for better UX
  - Handle concurrent edits from multiple devices
  - Create offline detection and status indicator
  - Implement automatic sync on reconnection
  - Add sync queue for offline changes
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 12. Add internationalization support
  - Set up i18n library (next-intl)
  - Create translation files for English and Thai
  - Implement language switcher component
  - Apply translations to all UI text
  - Persist language preference in user profile
  - Load interface in user's preferred language on login
  - _Requirements: 10.4, 10.5_

- [x] 13. Implement user settings page
  - Create settings page layout
  - Build currency preference selector
  - Build language preference selector
  - Build theme preference selector
  - Implement profile update functionality
  - Add password change functionality
  - Display account information (email, created date)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 14. Add responsive design and mobile optimization
  - Implement responsive breakpoints for all components
  - Create mobile-optimized navigation menu
  - Add touch-optimized controls for mobile devices
  - Test and fix layout issues on various screen sizes (320px to 2560px)
  - Optimize images for mobile with Next.js Image component
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 15. Implement error handling and loading states
  - Create custom error handler hook
  - Add error boundaries for component failures
  - Implement toast notifications for user feedback
  - Add loading spinners for async operations
  - Handle authentication errors gracefully
  - Handle validation errors with clear messages
  - Handle network errors with retry options
  - _Requirements: 1.2, 2.2, 2.4, 7.4_

- [x] 16. Optimize performance
  - Implement pagination for game list (50 items per page)
  - Add lazy loading for images
  - Implement code splitting for heavy components (charts, PDF generator)
  - Set up caching strategy with SWR
  - Optimize bundle size by removing unused dependencies
  - Add loading skeletons for better perceived performance
  - _Requirements: 9.5_

- [x] 17. Set up deployment pipeline
  - Connect GitHub repository to Vercel
  - Configure environment variables in Vercel dashboard
  - Set up custom domain (rakgame.app)
  - Enable automatic deployments on push to main branch
  - Configure preview deployments for pull requests
  - Set up Vercel Analytics
  - _Requirements: 7.1, 9.5_

- [x] 18. Write integration tests for critical flows
  - Write tests for authentication flow (login, register, logout)
  - Write tests for game CRUD operations
  - Write tests for seller management
  - Write tests for duplicate detection
  - Write tests for export functionality
  - Set up test database for integration tests
  - _Requirements: All_
