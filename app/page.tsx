'use client';

import { useState } from 'react';
import PaymentForm from './components/PaymentForm';

type PaymentResult = {
  success: boolean;
  message: string;
  data?: any;
};

export default function Home() {
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string>('');

  const handlePaymentComplete = (data: any) => {
    setPaymentResult({
      success: true,
      message: 'Payment completed successfully!',
      data: data,
    });
    setError('');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setPaymentResult(null);
  };

  const handleReset = () => {
    setPaymentResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Fat Zebra Payment Demo
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Secure payment integration with 3D Secure (3DS) authentication
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Sandbox Environment
          </div>
        </div>

        {/* Payment Result Messages */}
        {paymentResult && (
          <div className="mb-6 p-6 bg-green-50 border-2 border-green-500 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-green-800">{paymentResult.message}</p>
                {paymentResult.data && (
                  <div className="mt-3 p-3 bg-white rounded text-sm">
                    <p className="font-medium text-gray-900">Transaction Details:</p>
                    <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(paymentResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              <button
                onClick={handleReset}
                className="text-green-600 hover:text-green-800"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {error && (
          <div className="mb-6 p-6 bg-red-50 border-2 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Payment Error
                </h3>
                <p className="text-red-800">{error}</p>
              </div>
              <button
                onClick={handleReset}
                className="text-red-600 hover:text-red-800"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Payment Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Checkout
            </h2>
            <p className="text-gray-600">
              Enter payment details below. All payments require 3D Secure authentication.
            </p>
          </div>

          <PaymentForm
            onPaymentComplete={handlePaymentComplete}
            onError={handleError}
          />
        </div>

        {/* Information Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure & PCI Compliant</h3>
            <p className="text-sm text-gray-600">
              All card data is handled securely with industry-standard encryption
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">✓</div>
            <h3 className="font-semibold text-gray-900 mb-2">3DS Authentication</h3>
            <p className="text-sm text-gray-600">
              Mandatory 3D Secure verification for every payment transaction
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">💳</div>
            <h3 className="font-semibold text-gray-900 mb-2">Tokenized Cards</h3>
            <p className="text-sm text-gray-600">
              Save cards securely for faster checkout in future payments
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Powered by{' '}
            <a
              href="https://fatzebra.com.au"
            target="_blank"
            rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Fat Zebra
            </a>{' '}
            Payment Gateway
          </p>
          <p className="mt-2">
            This is a demonstration application for payment integration
          </p>
        </div>
      </div>
    </div>
  );
}
