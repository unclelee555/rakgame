# Integration Tests

This directory contains integration tests for the RakGame application's critical flows.

## Test Structure

- `setup.ts` - Global test setup and configuration
- `helpers/` - Test utilities and mock helpers
- `integration/` - Integration test suites

## Test Suites

### Authentication Tests (`auth.test.tsx`)
Tests for user authentication flows:
- User login with valid/invalid credentials
- User registration with validation
- Email format validation
- Password confirmation matching
- Logout functionality

### Game CRUD Tests (`games.test.tsx`)
Tests for game collection management:
- Create new game entries
- Read and display game list
- Update existing games
- Delete games
- Form validation (required fields, price validation)
- Empty state handling

### Seller Management Tests (`sellers.test.tsx`)
Tests for seller management:
- Create new sellers
- Read and display seller list (alphabetical order)
- Update existing sellers
- Delete sellers (with soft delete handling)
- Form validation (name required, URL format)
- Empty state handling

### Duplicate Detection Tests (`duplicate-detection.test.tsx`)
Tests for duplicate game detection:
- Exact duplicate detection (same title + platform)
- Case-insensitive matching
- Platform differentiation
- Multiple duplicate detection
- Whitespace trimming
- Exclude current game when editing
- Visual indicators for duplicates

### Export Functionality Tests (`export.test.tsx`)
Tests for data export features:
- CSV export with all fields
- JSON export with complete data structure
- PDF export generation
- Export timestamp inclusion
- User identifier inclusion
- Large collection handling (up to 1000 entries)
- Empty collection handling
- Special character escaping (CSV)

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Database Setup

The tests use mocked Supabase clients to avoid requiring a real database connection. The mock setup is in `helpers/supabase-mock.ts`.

For integration tests that require a real database:
1. Set up a test Supabase project
2. Configure environment variables in `.env.test`
3. Run migrations on the test database
4. Update test configuration to use real client

## Mock Strategy

- **Supabase Client**: Mocked using Vitest's `vi.fn()` to simulate database operations
- **Next.js Router**: Mocked to prevent navigation during tests
- **Internationalization**: Mocked to return translation keys directly
- **Toast Notifications**: Mocked to verify user feedback

## Requirements Coverage

These tests cover all requirements from the requirements document:
- Requirement 1: User Account Management (auth.test.tsx)
- Requirement 2: Game Collection Management (games.test.tsx)
- Requirement 3: Seller Management (sellers.test.tsx)
- Requirement 4: Search and Filter (covered in component tests)
- Requirement 5: Spending Analytics (covered in component tests)
- Requirement 6: Data Export (export.test.tsx)
- Requirement 7: Cloud Synchronization (covered in component tests)
- Requirement 8: Duplicate Prevention (duplicate-detection.test.tsx)
- Requirement 9: Responsive UI (covered in component tests)
- Requirement 10: Theme and Localization (covered in component tests)

## Best Practices

1. **Focus on Core Functionality**: Tests focus on critical user flows and business logic
2. **Minimal Mocking**: Only mock external dependencies (Supabase, Next.js APIs)
3. **Real User Interactions**: Use `@testing-library/user-event` for realistic interactions
4. **Async Handling**: Properly wait for async operations with `waitFor`
5. **Clear Assertions**: Each test has clear, specific assertions
6. **Test Isolation**: Each test is independent and can run in any order
