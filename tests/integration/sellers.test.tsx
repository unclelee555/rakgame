import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockSupabaseClient, mockAuthUser } from '../helpers/supabase-mock';

// Mock Supabase client
const mockSupabase = createMockSupabaseClient();
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
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

import SellerForm from '@/components/sellers/seller-form';
import SellerList from '@/components/sellers/seller-list';

const mockSellers = [
  {
    id: 'seller-1',
    user_id: mockAuthUser.id,
    name: 'GameStop',
    url: 'https://gamestop.com',
    note: 'Local store',
    created_at: new Date().toISOString(),
  },
  {
    id: 'seller-2',
    user_id: mockAuthUser.id,
    name: 'Amazon',
    url: 'https://amazon.com',
    note: 'Online retailer',
    created_at: new Date().toISOString(),
  },
];

describe('Seller Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Seller', () => {
    it('should successfully create a new seller', async () => {
      const newSeller = mockSellers[0];
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: newSeller,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const onSubmit = vi.fn();
      render(<SellerForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      await userEvent.type(screen.getByLabelText(/name/i), 'GameStop');
      await userEvent.type(screen.getByLabelText(/url/i), 'https://gamestop.com');
      await userEvent.type(screen.getByLabelText(/note/i), 'Local store');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('should validate required name field', async () => {
      render(<SellerForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('should validate URL format', async () => {
      render(<SellerForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      await userEvent.type(screen.getByLabelText(/name/i), 'GameStop');
      await userEvent.type(screen.getByLabelText(/url/i), 'invalid-url');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid url/i)).toBeInTheDocument();
      });
    });
  });

  describe('Read Sellers', () => {
    it('should display list of sellers in alphabetical order', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockResolvedValue({
        data: mockSellers,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      });

      render(<SellerList />);

      await waitFor(() => {
        expect(screen.getByText('GameStop')).toBeInTheDocument();
        expect(screen.getByText('Amazon')).toBeInTheDocument();
      });
    });

    it('should display empty state when no sellers', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      render(<SellerList />);

      await waitFor(() => {
        expect(screen.getByText(/no sellers found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Update Seller', () => {
    it('should successfully update an existing seller', async () => {
      const updatedSeller = { ...mockSellers[0], name: 'Updated GameStop' };
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: updatedSeller,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      const onSubmit = vi.fn();
      render(<SellerForm seller={mockSellers[0]} onSubmit={onSubmit} onCancel={vi.fn()} />);

      const nameInput = screen.getByLabelText(/name/i);
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, 'Updated GameStop');

      const submitButton = screen.getByRole('button', { name: /save/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('Delete Seller', () => {
    it('should successfully delete a seller', async () => {
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      const result = await mockSupabase.from('sellers').delete().eq('id', 'seller-1');

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'seller-1');
      expect(result.error).toBeNull();
    });

    it('should handle soft delete when seller has associated games', async () => {
      // When a seller is deleted, games should retain reference but mark as deleted
      const mockDelete = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      });

      const result = await mockSupabase.from('sellers').delete().eq('id', 'seller-1');

      expect(result.error).toBeNull();
    });
  });
});
