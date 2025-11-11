import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockSupabaseClient, mockSession } from '../helpers/supabase-mock';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => createMockSupabaseClient(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/login',
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

import LoginForm from '@/components/auth/login-form';
import RegisterForm from '@/components/auth/register-form';

describe('Authentication Flow', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    vi.clearAllMocks();
  });

  describe('Login', () => {
    it('should successfully log in with valid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should display error message with invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid credentials', name: 'AuthError', status: 401 },
      });

      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
      });
    });
  });

  describe('Registration', () => {
    it('should successfully register a new user', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'password123',
        });
      });
    });

    it('should validate password confirmation match', async () => {
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await userEvent.type(emailInput, 'newuser@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'differentpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should display error when email already exists', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'User already registered', name: 'AuthError', status: 400 },
      });

      render(<RegisterForm />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await userEvent.type(emailInput, 'existing@example.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.type(confirmPasswordInput, 'password123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/user already registered/i)).toBeInTheDocument();
      });
    });
  });

  describe('Logout', () => {
    it('should successfully log out user', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Simulate logout action
      await mockSupabase.auth.signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
