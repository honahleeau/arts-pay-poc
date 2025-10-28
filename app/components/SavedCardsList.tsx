'use client';

import { useState, useEffect } from 'react';
import { cardStorage, SavedCard } from '@/lib/cardStorage';

interface SavedCardsListProps {
  onSelectCard: (card: SavedCard) => void;
  selectedCard?: SavedCard | null;
}

export default function SavedCardsList({ onSelectCard, selectedCard }: SavedCardsListProps) {
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);

  useEffect(() => {
    setSavedCards(cardStorage.getCards());
  }, []);

  const handleRemoveCard = (token: string, e: React.MouseEvent) => {
    e.stopPropagation();
    cardStorage.removeCard(token);
    setSavedCards(cardStorage.getCards());
  };

  if (savedCards.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">No saved cards yet.</p>
        <p className="text-sm text-gray-500 mt-2">Add a new card to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold mb-4">Saved Cards</h3>
      {savedCards.map((card) => (
        <div
          key={card.token}
          onClick={() => onSelectCard(card)}
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
            selectedCard?.token === card.token
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-8 rounded flex items-center justify-center ${
                card.cardBrand.toLowerCase() === 'visa' 
                  ? 'bg-blue-600 text-white'
                  : card.cardBrand.toLowerCase() === 'mastercard'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-400 text-white'
              }`}>
                {card.cardBrand.substring(0, 1)}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  **** **** **** {card.cardNumber}
                </div>
                <div className="text-sm text-gray-600">
                  {card.cardBrand} • {card.cardholder}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Expires {card.expiryMonth}/{card.expiryYear}
                </div>
              </div>
            </div>
            <button
              onClick={(e) => handleRemoveCard(card.token, e)}
              className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

