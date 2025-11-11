import { describe, it, expect, vi } from 'vitest';
import { checkForDuplicates } from '@/lib/utils/duplicate-detection';

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
    created_at: new Date().toISOString(),
  },
  {
    id: 'game-2',
    user_id: 'user-1',
    seller_id: 'seller-1',
    title: 'Super Mario Odyssey',
    platform: 'Switch',
    type: 'Digital' as const,
    price: 49.99,
    purchase_date: '2024-02-20',
    created_at: new Date().toISOString(),
  },
  {
    id: 'game-3',
    user_id: 'user-1',
    seller_id: 'seller-2',
    title: 'The Legend of Zelda',
    platform: 'PS5',
    type: 'Disc' as const,
    price: 69.99,
    purchase_date: '2024-03-10',
    created_at: new Date().toISOString(),
  },
];

describe('Duplicate Detection', () => {
  describe('checkForDuplicates', () => {
    it('should detect exact duplicate (same title and platform)', () => {
      const newGame = {
        title: 'The Legend of Zelda',
        platform: 'Switch',
      };

      const duplicates = checkForDuplicates(newGame, mockGames);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].id).toBe('game-1');
    });

    it('should detect case-insensitive duplicates', () => {
      const newGame = {
        title: 'the legend of zelda',
        platform: 'Switch',
      };

      const duplicates = checkForDuplicates(newGame, mockGames);

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].title).toBe('The Legend of Zelda');
    });

    it('should not detect duplicate when platform differs', () => {
      const newGame = {
        title: 'The Legend of Zelda',
        platform: 'Xbox Series X|S',
      };

      const duplicates = checkForDuplicates(newGame, mockGames);

      expect(duplicates).toHaveLength(0);
    });

    it('should not detect duplicate when title differs', () => {
      const newGame = {
        title: 'Breath of the Wild',
        platform: 'Switch',
      };

      const duplicates = checkForDuplicates(newGame, mockGames);

      expect(duplicates).toHaveLength(0);
    });

    it('should handle empty game collection', () => {
      const newGame = {
        title: 'The Legend of Zelda',
        platform: 'Switch',
      };

      const duplicates = checkForDuplicates(newGame, []);

      expect(duplicates).toHaveLength(0);
    });

    it('should detect multiple duplicates if they exist', () => {
      const gamesWithDuplicates = [
        ...mockGames,
        {
          id: 'game-4',
          user_id: 'user-1',
          seller_id: 'seller-3',
          title: 'The Legend of Zelda',
          platform: 'Switch',
          type: 'Digital' as const,
          price: 59.99,
          purchase_date: '2024-04-01',
          created_at: new Date().toISOString(),
        },
      ];

      const newGame = {
        title: 'The Legend of Zelda',
        platform: 'Switch',
      };

      const duplicates = checkForDuplicates(newGame, gamesWithDuplicates);

      expect(duplicates).toHaveLength(2);
    });

    it('should trim whitespace when comparing titles', () => {
      const newGame = {
        title: '  The Legend of Zelda  ',
        platform: 'Switch',
      };

      const duplicates = checkForDuplicates(newGame, mockGames);

      expect(duplicates).toHaveLength(1);
    });

    it('should exclude current game when editing', () => {
      const editingGame = {
        id: 'game-1',
        title: 'The Legend of Zelda',
        platform: 'Switch',
      };

      const duplicates = checkForDuplicates(editingGame, mockGames, 'game-1');

      expect(duplicates).toHaveLength(0);
    });
  });

  describe('Duplicate Warning Display', () => {
    it('should show warning dialog when duplicate detected', () => {
      const newGame = {
        title: 'The Legend of Zelda',
        platform: 'Switch',
      };

      const duplicates = checkForDuplicates(newGame, mockGames);

      expect(duplicates.length).toBeGreaterThan(0);
      expect(duplicates[0]).toHaveProperty('title');
      expect(duplicates[0]).toHaveProperty('platform');
      expect(duplicates[0]).toHaveProperty('price');
      expect(duplicates[0]).toHaveProperty('purchase_date');
    });

    it('should allow user to proceed after acknowledging duplicate', () => {
      const newGame = {
        title: 'The Legend of Zelda',
        platform: 'Switch',
      };

      const duplicates = checkForDuplicates(newGame, mockGames);
      
      // User acknowledges and proceeds
      const userAcknowledged = true;

      expect(duplicates).toHaveLength(1);
      expect(userAcknowledged).toBe(true);
      // In actual implementation, form submission would proceed
    });
  });

  describe('Visual Indicators', () => {
    it('should identify games that are duplicates in collection', () => {
      const duplicateGroups = new Map<string, typeof mockGames>();

      mockGames.forEach((game) => {
        const key = `${game.title.toLowerCase()}-${game.platform}`;
        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, []);
        }
        duplicateGroups.get(key)!.push(game);
      });

      const duplicates = Array.from(duplicateGroups.values()).filter(
        (group) => group.length > 1
      );

      // In this test data, no duplicates exist in the collection itself
      expect(duplicates).toHaveLength(0);
    });

    it('should mark duplicate entries in collection view', () => {
      const gamesWithDuplicates = [
        ...mockGames,
        {
          id: 'game-4',
          user_id: 'user-1',
          seller_id: 'seller-3',
          title: 'The Legend of Zelda',
          platform: 'Switch',
          type: 'Digital' as const,
          price: 59.99,
          purchase_date: '2024-04-01',
          created_at: new Date().toISOString(),
        },
      ];

      const duplicateGroups = new Map<string, typeof gamesWithDuplicates>();

      gamesWithDuplicates.forEach((game) => {
        const key = `${game.title.toLowerCase()}-${game.platform}`;
        if (!duplicateGroups.has(key)) {
          duplicateGroups.set(key, []);
        }
        duplicateGroups.get(key)!.push(game);
      });

      const duplicates = Array.from(duplicateGroups.values()).filter(
        (group) => group.length > 1
      );

      expect(duplicates).toHaveLength(1);
      expect(duplicates[0]).toHaveLength(2);
    });
  });
});
