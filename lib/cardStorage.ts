// Card storage utility for managing saved cards in localStorage

export interface SavedCard {
  token: string;
  cardNumber: string; // Last 4 digits
  cardBrand: string; // e.g., 'Visa', 'Mastercard'
  expiryMonth: string;
  expiryYear: string;
  cardholder: string;
  lastUsed?: string;
}

const STORAGE_KEY = 'fatzebra_saved_cards';

export const cardStorage = {
  // Get all saved cards
  getCards(): SavedCard[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const cards = localStorage.getItem(STORAGE_KEY);
      return cards ? JSON.parse(cards) : [];
    } catch (error) {
      console.error('Error reading cards from localStorage:', error);
      return [];
    }
  },

  // Add a new card
  addCard(card: SavedCard): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cards = this.getCards();
      
      // Check if card with same token already exists
      if (!cards.find(c => c.token === card.token)) {
        const newCard = {
          ...card,
          lastUsed: new Date().toISOString(),
        };
        cards.push(newCard);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
      }
    } catch (error) {
      console.error('Error saving card to localStorage:', error);
    }
  },

  // Remove a card by token
  removeCard(token: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cards = this.getCards();
      const filtered = cards.filter(c => c.token !== token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing card from localStorage:', error);
    }
  },

  // Get a specific card by token
  getCard(token: string): SavedCard | undefined {
    const cards = this.getCards();
    return cards.find(c => c.token === token);
  },

  // Clear all saved cards
  clearCards(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cards from localStorage:', error);
    }
  },

  // Update last used timestamp
  updateLastUsed(token: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const cards = this.getCards();
      const updated = cards.map(c => 
        c.token === token 
          ? { ...c, lastUsed: new Date().toISOString() }
          : c
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating last used timestamp:', error);
    }
  },
};

