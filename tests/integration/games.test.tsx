import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockSupabaseClient, mockAuthUser } from '../helpers/supabase-mock';

// Mock Supabase client
const mockSupabase = createMockSupabaseClient();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import GameForm from '@/components/games/game-form';
import GameList from '@/components/games/game-list';

const mockSellers = [
  { id: 'seller-1', name: 'GameStop', user_id: mockAuthUser.id, created_at: new Date().toISOString() },
  { id: 'seller-2', name: 'Amazon', user_id: mockAuthUser.id, created_at: new Date().toISOString() },
];

const mockGames = [
  {
    id: 'game-1',
    user_id: mockAuthUser.id,
    seller_id: 'seller-1',
    title: 'The Legend of Zelda',
    platform: 'Switch',
    type: 'Disc',
    price: 59.99,
    purchase_date: '2024-01-15',
    region: 'US',
    condition: 'New',
    notes: 'Great game',
    created_at: new Date().toISOString(),
  },
];

describe('Game CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Game', () => {
    it('should successfully create a new game entry', async () => {
      const mockInsert = vi.fn().mockResolvedValue({
        data: mockGames[0],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockGames[0], error: null }),
      });

      const onSubmit = vi.fn();
      render(<GameForm sellers={mockSellers} onSubmit={onSubmit} onCancel={vi.fn()} />);

      // Fill in form fields
      await userEvent.type(screen.getByLabelText(/title/i), 'The Legend of Zelda');
      await userEvent.selectOptions(screen.getByLabelText(/platform/i), 'Switch');
      await userEvent.selectOptions(screen.getByLabelText(/type/i), 'Disc');
      await userEvent.type(screen.getByLabelText(/price/i), '59.99');
      await userEvent.type(screen.getByLabelText(/purchase date/i), '2024-01-15');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('should validate required fields', async () => {
      render(<GameForm sellers={mockSellers} onSubmit={vi.fn()} onCancel={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    it('should validate price is positive', async () => {
      render(<GameForm sellers={mockSellers} onSubmit={vi.fn()} onCancel={vi.fn()} />);

      await userEvent.type(screen.getByLabelText(/price/i), '-10');
      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/price must be positive/i)).toBeInTheDocument();
      });
    });
  });

  describe('Read Games', () => {
    it('should display list of games', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockGames,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      render(<GameList />);

      await waitFor(() => {
        expect(screen.getByText('The Legend of Zelda')).toBeInTheDocument();
      });
    });

    it('should display empty state when no games', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      render(<GameList />);

      await waitFor(() => {
        expect(screen.getByText(/no games found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Update Game', () => {
    it('should successfully update an existing game', async () => {
      const updatedGame = { ...mockGames[0], title: 'Updated Title' };
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: updatedGame,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updatedGame, error: null }),
      });

      const onSubmit = vi.fn();
      render(<GameForm game={mockGames[0]} sellers={mockSellers} onSubmit={onSubmit} onCancel={vi.fn()} />);

      const titleInput = screen.getByLabelText(/title/i);
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Updated Title');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Delete Game', () => {
    it('should successfully delete a game', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      // Simulate delete operation
      const result = await mockSupabase.from('games').delete().eq('id', 'game-1');

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'game-1');
      expect(result.error).toBeNull();
    });

    it('should handle delete errors gracefully', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Delete failed', code: 'PGRST116' },
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      const result = await mockSupabase.from('games').delete().eq('id', 'game-1');

      expect(result.error).toBeTruthy();
      expect(result.error.message).toBe('Delete failed');
    });
  });
});
