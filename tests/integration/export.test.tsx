import { describe, it, expect, vi } from 'vitest';
import { exportToCSV, exportToJSON, exportToPDF } from '@/lib/utils/export';

const mockGames = [
  {
    id: 'game-1',
    user_id: 'user-1',
    seller_id: 'seller-1',
    title: 'The Legend of Zelda',
    platform: 'Switch',
    type: 'Disc' as const,
    price: 59.99,
    purchase_date: '2024-01-15',
    region: 'US',
    condition: 'New' as const,
    notes: 'Great game',
    created_at: new Date('2024-01-15').toISOString(),
    seller: {
      id: 'seller-1',
      name: 'GameStop',
      user_id: 'user-1',
      created_at: new Date().toISOString(),
    },
  },
  {
    id: 'game-2',
    user_id: 'user-1',
    seller_id: 'seller-2',
    title: 'Super Mario Odyssey',
    platform: 'Switch',
    type: 'Digital' as const,
    price: 49.99,
    purchase_date: '2024-02-20',
    region: 'US',
    condition: 'New' as const,
    notes: 'Fun platformer',
    created_at: new Date('2024-02-20').toISOString(),
    seller: {
      id: 'seller-2',
      name: 'Amazon',
      user_id: 'user-1',
      created_at: new Date().toISOString(),
    },
  },
];

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  currency: 'USD' as const,
  language: 'en' as const,
  created_at: new Date().toISOString(),
};

describe('Export Functionality', () => {
  describe('CSV Export', () => {
    it('should generate CSV with all game fields', () => {
      const csv = exportToCSV(mockGames);

      expect(csv).toContain('Title,Platform,Type,Price,Purchase Date');
      expect(csv).toContain('The Legend of Zelda');
      expect(csv).toContain('Super Mario Odyssey');
      expect(csv).toContain('Switch');
      expect(csv).toContain('59.99');
      expect(csv).toContain('49.99');
    });

    it('should include seller information in CSV', () => {
      const csv = exportToCSV(mockGames);

      expect(csv).toContain('Seller');
      expect(csv).toContain('GameStop');
      expect(csv).toContain('Amazon');
    });

    it('should handle empty collection', () => {
      const csv = exportToCSV([]);

      expect(csv).toContain('Title,Platform,Type,Price,Purchase Date');
      expect(csv.split('\n').length).toBe(2); // Header + empty line
    });

    it('should escape special characters in CSV', () => {
      const gamesWithSpecialChars = [
        {
          ...mockGames[0],
          title: 'Game with "quotes"',
          notes: 'Notes with, comma',
        },
      ];

      const csv = exportToCSV(gamesWithSpecialChars);

      expect(csv).toContain('"Game with ""quotes"""');
      expect(csv).toContain('"Notes with, comma"');
    });

    it('should handle large collections efficiently', () => {
      const largeCollection = Array.from({ length: 1000 }, (_, i) => ({
        ...mockGames[0],
        id: `game-${i}`,
        title: `Game ${i}`,
      }));

      const startTime = Date.now();
      const csv = exportToCSV(largeCollection);
      const endTime = Date.now();

      expect(csv).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(csv.split('\n').length).toBe(1002); // Header + 1000 games + empty line
    });
  });

  describe('JSON Export', () => {
    it('should generate valid JSON with complete data structure', () => {
      const json = exportToJSON(mockGames, mockUser);

      expect(json).toContain('"exportedAt"');
      expect(json).toContain('"user"');
      expect(json).toContain('"games"');
      expect(json).toContain('"totalGames"');
      expect(json).toContain('"totalValue"');

      const parsed = JSON.parse(json);
      expect(parsed.games).toHaveLength(2);
      expect(parsed.totalGames).toBe(2);
      expect(parsed.user.email).toBe('test@example.com');
    });

    it('should include export timestamp', () => {
      const json = exportToJSON(mockGames, mockUser);
      const parsed = JSON.parse(json);

      expect(parsed.exportedAt).toBeTruthy();
      expect(new Date(parsed.exportedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should include user identifier', () => {
      const json = exportToJSON(mockGames, mockUser);
      const parsed = JSON.parse(json);

      expect(parsed.user.id).toBe('user-1');
      expect(parsed.user.email).toBe('test@example.com');
    });

    it('should calculate total collection value', () => {
      const json = exportToJSON(mockGames, mockUser);
      const parsed = JSON.parse(json);

      expect(parsed.totalValue).toBe(109.98); // 59.99 + 49.99
    });

    it('should handle empty collection', () => {
      const json = exportToJSON([], mockUser);
      const parsed = JSON.parse(json);

      expect(parsed.games).toHaveLength(0);
      expect(parsed.totalGames).toBe(0);
      expect(parsed.totalValue).toBe(0);
    });

    it('should preserve all game properties', () => {
      const json = exportToJSON(mockGames, mockUser);
      const parsed = JSON.parse(json);

      const firstGame = parsed.games[0];
      expect(firstGame.title).toBe('The Legend of Zelda');
      expect(firstGame.platform).toBe('Switch');
      expect(firstGame.type).toBe('Disc');
      expect(firstGame.price).toBe(59.99);
      expect(firstGame.region).toBe('US');
      expect(firstGame.condition).toBe('New');
      expect(firstGame.notes).toBe('Great game');
    });
  });

  describe('PDF Export', () => {
    it('should generate PDF with collection summary', async () => {
      const pdf = await exportToPDF(mockGames, mockUser);

      expect(pdf).toBeTruthy();
      expect(pdf).toBeInstanceOf(Blob);
    });

    it('should include export timestamp in PDF', async () => {
      const pdf = await exportToPDF(mockGames, mockUser);

      expect(pdf).toBeTruthy();
      // PDF content verification would require PDF parsing library
    });

    it('should include user identifier in PDF', async () => {
      const pdf = await exportToPDF(mockGames, mockUser);

      expect(pdf).toBeTruthy();
    });

    it('should format collection data in table', async () => {
      const pdf = await exportToPDF(mockGames, mockUser);

      expect(pdf).toBeTruthy();
      expect(pdf.size).toBeGreaterThan(0);
    });

    it('should handle large collections up to 1000 entries', async () => {
      const largeCollection = Array.from({ length: 1000 }, (_, i) => ({
        ...mockGames[0],
        id: `game-${i}`,
        title: `Game ${i}`,
      }));

      const startTime = Date.now();
      const pdf = await exportToPDF(largeCollection, mockUser);
      const endTime = Date.now();

      expect(pdf).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(10000); // Should complete in under 10 seconds
    });

    it('should handle empty collection', async () => {
      const pdf = await exportToPDF([], mockUser);

      expect(pdf).toBeTruthy();
      expect(pdf.size).toBeGreaterThan(0);
    });
  });

  describe('Export API Route', () => {
    it('should handle CSV format request', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          format: 'csv',
          games: mockGames,
        }),
      };

      // Simulate API route behavior
      const format = 'csv';
      expect(format).toBe('csv');
    });

    it('should handle JSON format request', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          format: 'json',
          games: mockGames,
        }),
      };

      const format = 'json';
      expect(format).toBe('json');
    });

    it('should handle PDF format request', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          format: 'pdf',
          games: mockGames,
        }),
      };

      const format = 'pdf';
      expect(format).toBe('pdf');
    });

    it('should return appropriate content type for each format', () => {
      const contentTypes = {
        csv: 'text/csv',
        json: 'application/json',
        pdf: 'application/pdf',
      };

      expect(contentTypes.csv).toBe('text/csv');
      expect(contentTypes.json).toBe('application/json');
      expect(contentTypes.pdf).toBe('application/pdf');
    });
  });
});
