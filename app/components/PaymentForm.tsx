'use client';

import { useState } from 'react';
import { VerifyCard, VerifyExistingCard } from '@fat-zebra/sdk/dist/react';
import { Handlers, PublicEvent } from '@fat-zebra/sdk/dist/shared/types';
import { Environment } from '@fat-zebra/sdk/dist/shared/env';
import { cardStorage, SavedCard } from '@/lib/cardStorage';
import SavedCardsList from './SavedCardsList';

interface PaymentFormProps {
  onPaymentComplete: (result: any) => void;
  onError: (error: string) => void;
}

type PaymentStep = 'amount' | 'card_selection' | 'card_sdk' | 'processing' | 'complete';

interface SDKConfig {
  username: string;
  accessToken: string;
  environment: Environment;
  paymentIntent: {
    payment: {
      reference: string;
      amount: number;
      currency: string;
    };
    verification: string;
  };
  options: {
    sca_enabled: boolean;
    iframe?: boolean;
  };
}

export default function PaymentForm({ onPaymentComplete, onError }: PaymentFormProps) {
  const [step, setStep] = useState<PaymentStep>('amount');
  const [amount, setAmount] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<SavedCard | null>(null);
  const [useSavedCard, setUseSavedCard] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [sdkConfig, setSDKConfig] = useState<SDKConfig | null>(null);
  const [sdkCardToken, setSDKCardToken] = useState<string>('');

  // Get OAuth access token
  const getAccessToken = async () => {
    try {
      const response = await fetch('/api/oauth', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to obtain access token');
      const result = await response.json();
      // The token is now nested under result.data.token per API response contract
      console.log("============================response");
      console.log("data", result.data?.token);
      console.log("data", result.data?.token);
      console.log("============================response");
      return result.data?.token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  // Get verification hash
  const getVerificationHash = async (payment?: any, cardToken?: string) => {
    const response = await fetch('/api/verification-hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment, cardToken }),
    });

    if (!response.ok) throw new Error('Failed to get verification hash');
    const data = await response.json();
    return data.verification;
  };

  // Generate payment reference
  const generateReference = () => {
    return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Process payment after 3DS success
  const processPayment = async (token: string, cardholder: string) => {
    try {
      setStep('processing');
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          amount: parseFloat(amount),
          token,
          cardholder,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment failed');
      
      onPaymentComplete(data);
    } catch (error: any) {
      onError(error.message);
      setStep('card_selection');
    }
  };

  // Initialize SDK for new card
  const initializeNewCardSDK = async () => {
    try {
      console.log('Step 1: Getting access token...');
      const token = await getAccessToken();
      console.log("============================");
      console.log('initializeNewCardSDK.token', token);
      console.log("============================");

      setAccessToken(token);

      const payment = {
        reference: generateReference(),
        amount: parseFloat(amount),
        currency: 'AUD',
      };
      console.log('Step 3: Payment object created:', payment);

      const verification = await getVerificationHash(payment);
    //   console.log('Step 4: Verification hash received:', verification.substring(0, 20) + '...');
      
      const username = process.env.NEXT_PUBLIC_FAT_ZEBRA_USERNAME || '';
      console.log('Step 5: Username from env:', username || '(empty - check your .env file)');
      
      const environment = Environment.sandbox; // or Environment.production

      const config = {
        username,
        accessToken: token,
        environment,
        paymentIntent: {
          payment,
          verification,
        },
        options: {
          sca_enabled: true,
        },
      };
      console.log('Step 6: SDK Config created:', config);
      
      setSDKConfig(config);
      console.log('Step 7: Moving to card_sdk step...');
      setStep('card_sdk');
    } catch (error: any) {
      console.error('Error initializing new card SDK:', error);
      onError(error.message);
    }
  };

  // Initialize SDK for saved card
  const initializeSavedCardSDK = async () => {
    if (!selectedCard) {
      onError('Please select a card');
      return;
    }

    try {
      const token = await getAccessToken();
      console.log('token1', token);
      setAccessToken(token);

      const verification = await getVerificationHash(null, selectedCard.token);
      const username = process.env.NEXT_PUBLIC_FAT_ZEBRA_USERNAME || '';
      const environment = Environment.sandbox;
    console.log('username', username);
    console.log('token', token);
    console.log('verification', verification);
    console.log('environment', environment);
    console.log('amount', amount);
    console.log('selectedCard', selectedCard);
    
      const payment = {
        reference: generateReference(),
        amount: parseFloat(amount),
        currency: 'AUD',
      };

      setSDKConfig({
        username,
        accessToken: token,
        environment,
        paymentIntent: {
          payment,
          verification,
        },
        options: {
          sca_enabled: true,
          iframe: true,
        //   iframe: true,
        //   iframe_url: 'https://www.google.com',
        //   iframe_width: '100%',
        //   iframe_height: '700px',
        //   iframe_style: {
        //     width: '100%',
        //     height: '700px',
        //   },
        },
      });

      setSDKCardToken(selectedCard.token);
      setStep('card_sdk');
    } catch (error: any) {
      onError(error.message);
    }
  };


  // Handlers for VerifyCard (new card)
  const newCardHandlers = {
    [PublicEvent.TOKENIZATION_SUCCESS]: (event: CustomEvent) => {
      const cardData = event.detail;
      console.log('Card tokenized successfully:', cardData);
      
      // Save card to storage
      try {
        cardStorage.addCard({
          token: cardData.card_token,
          cardNumber: cardData.card_last_four || '****',
          cardBrand: cardData.card_brand || 'Unknown',
          expiryMonth: '**',
          expiryYear: '**',
          cardholder: cardData.card_holder_name || 'Customer',
        });
      } catch (error) {
        console.error('Error saving card:', error);
      }
    },
    
    [PublicEvent.SCA_SUCCESS]: async (event: CustomEvent) => {
      const cardData = event.detail;
      const cardToken = cardData.card_token;
      const cardholder = cardData.card_holder_name || 'Customer';
      
      console.log('3DS authentication successful:', cardData);
      
      // Process payment after 3DS success
      await processPayment(cardToken, cardholder);
    },
    
    [PublicEvent.SCA_ERROR]: (event: CustomEvent) => {
      console.error('3DS error:', event.detail);
      onError('3DS authentication failed. Please try again.');
      setStep('card_selection');
    },
    
    [PublicEvent.TOKENIZATION_ERROR]: (event: CustomEvent) => {
      console.error('Tokenization error:', event.detail);
      onError('Card tokenization failed. Please try again.');
      setStep('card_selection');
    },
  };

//  const [events, setEvents] = useState<Array<PublicEvent>>([]);

//   const addEvent = (event: any) => {
//     setEvents((prev: Array<PublicEvent>) => [...prev, event]);
//   };

//   const tokenizationSuccessful = (event: any) => {
//     addEvent(event);
//   };

//   const scaSuccess = (event: any) => {
//     addEvent(event);
//   };

//   const scaError = (event: any) => {
//     addEvent(event);
//   };

//   // Subscribe to the particular events you wish to handle
//   const newCardHandlers: Handlers = {
//     [PublicEvent.FORM_VALIDATION_ERROR]: addEvent,
//     [PublicEvent.FORM_VALIDATION_SUCCESS]: addEvent,
//     [PublicEvent.TOKENIZATION_SUCCESS]: tokenizationSuccessful,
//     [PublicEvent.SCA_SUCCESS]: scaSuccess,
//     [PublicEvent.SCA_ERROR]: scaError,
//   };


  // Handlers for VerifyExistingCard (saved card)
  const savedCardHandlers = {
    [PublicEvent.SCA_SUCCESS]: async (event: CustomEvent) => {
      console.log('3DS authentication successful for saved card:', event.detail);
      
      // Process payment with saved card token
      await processPayment(selectedCard!.token, selectedCard!.cardholder);
      
      // Update last used timestamp
      cardStorage.updateLastUsed(selectedCard!.token);
    },
    
    [PublicEvent.SCA_ERROR]: (event: CustomEvent) => {
      console.error('3DS error:', event.detail);
      onError('3DS authentication failed. Please try again.');
      setStep('card_selection');
    },
  };

  const handleAmountSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      onError('Please enter a valid amount');
      return;
    }
    setStep('card_selection');
  };

  const handleSelectNewCard = () => {
    setUseSavedCard(false);
    setSelectedCard(null);
    initializeNewCardSDK();
  };

  const handleSelectSavedCard = (card: SavedCard) => {
    setSelectedCard(card);
  };

  const handlePayWithSavedCard = () => {
    setUseSavedCard(true);
    initializeSavedCardSDK();
  };

  const handleCancelSDK = () => {
    setStep('card_selection');
    setSDKConfig(null);
    setSDKCardToken('');
  };

  const savedCards = cardStorage.getCards();

  // Debug: Show current step
  console.log('Current step:', step);
  console.log('SDK config exists:', !!sdkConfig);
  console.log('Access token exists:', !!accessToken);

  // Amount Input Step
  if (step === 'amount') {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount (AUD)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900 bg-white"
          />
        </div>
        <button
          onClick={handleAmountSubmit}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    );
  }

  // SDK Component Step (renders VerifyCard or VerifyExistingCard)
  if (step === 'card_sdk') {
    console.log('SDK step rendering - useSavedCard:', useSavedCard, 'sdkConfig:', !!sdkConfig);
    
    if (!sdkConfig) {
      console.warn('sdkConfig is null in card_sdk step!');
      return (
        <div className="space-y-6">
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Initialization Error</h3>
            <p className="text-red-800">SDK configuration failed to load. Please check the console for errors.</p>
            <button
              onClick={() => setStep('card_selection')}
              className="mt-4 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="text-center py-2 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
            <span className="font-medium">Amount: </span>
            <span className="font-bold">${amount}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">
              {useSavedCard ? 'Completing 3DS for saved card...' : 'Enter card details to complete payment'}
            </span>
          </div>
        </div>

        {useSavedCard && selectedCard ? (
          <VerifyExistingCard
            config={sdkConfig}
            handlers={savedCardHandlers}
            cardToken={sdkCardToken}
            iframeProps={{ width: '100%', height: '700px' }}
          />
        ) : (
          <VerifyCard
            config={sdkConfig}
            handlers={newCardHandlers}
            iframeProps={{ width: '100%', height: '700px' }}
          />
        )}

        <button
          onClick={handleCancelSDK}
          className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Card Selection Step
  return (
    <div className="space-y-6">
      <div className="text-center py-2 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
          <span className="font-medium">Amount: </span>
          <span className="font-bold">${amount}</span>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleSelectNewCard}
          className="w-full py-4 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Card
        </button>

        {savedCards.length > 0 && (
          <>
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <SavedCardsList
              onSelectCard={handleSelectSavedCard}
              selectedCard={selectedCard}
            />

            {selectedCard && (
              <button
                onClick={handlePayWithSavedCard}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Pay with Selected Card
              </button>
            )}
          </>
        )}
      </div>

      <button
        onClick={() => setStep('amount')}
        className="w-full text-gray-600 py-2 hover:text-gray-800 transition-colors"
      >
        ← Change Amount
      </button>
    </div>
  );
}
