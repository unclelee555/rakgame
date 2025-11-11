import { beforeAll, afterAll, afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Setup and teardown
beforeAll(() => {
  // Global setup
});

afterEach(() => {
  // Cleanup after each test
});

afterAll(() => {
  // Global cleanup
});
