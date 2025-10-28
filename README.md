# Fat Zebra Payment Integration Demo

A Next.js application demonstrating Fat Zebra payment processing with 3DS authentication, card tokenization, and saved card functionality.

## Features

- **Payment Processing**: Secure payment processing with Fat Zebra Gateway
- **3DS Authentication**: Strong Customer Authentication (SCA) support
- **Card Tokenization**: Secure card storage for future transactions
- **Saved Cards**: Manage and reuse saved payment methods
- **OAuth Integration**: Secure server-side authentication flow

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Fat Zebra API credentials (Client ID, Client Secret, Username, Shared Secret)

## Installation

1. Navigate to the project root directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Update `.env` with your Fat Zebra credentials:
   ```env
   FAT_ZEBRA_CLIENT_ID="your-client-id"
   FAT_ZEBRA_CLIENT_SECRET="your-client-secret"
   FAT_ZEBRA_OAUTH_URL="https://api.pmnts-sandbox.io/oauth/token"
   FAT_ZEBRA_BASE_URL="https://gateway.pmnts-sandbox.io"
   FAT_ZEBRA_SHARED_SECRET="your-shared-secret"
   NEXT_PUBLIC_FAT_ZEBRA_USERNAME="your-username"
   NEXT_PUBLIC_FAT_ZEBRA_BASE_URL="https://gateway.pmnts-sandbox.io"
   ```

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with webpack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── oauth/          # OAuth token endpoint
│   │   ├── payment/         # Payment processing endpoint
│   │   └── verification-hash/ # Verification hash generation
│   ├── components/
│   │   ├── PaymentForm.tsx  # Main payment form component
│   │   └── SavedCardsList.tsx # Saved cards management
│   └── page.tsx             # Main page component
├── lib/
│   └── cardStorage.ts       # Card storage utilities
└── .env                     # Environment variables
```

## Configuration

### Environment Variables

- `FAT_ZEBRA_CLIENT_ID` - Your Fat Zebra client ID
- `FAT_ZEBRA_CLIENT_SECRET` - Your Fat Zebra client secret
- `FAT_ZEBRA_OAUTH_URL` - OAuth endpoint URL
- `FAT_ZEBRA_BASE_URL` - Gateway base URL
- `FAT_ZEBRA_SHARED_SECRET` - Shared secret for verification hash
- `NEXT_PUBLIC_FAT_ZEBRA_USERNAME` - Username for SDK initialization
- `NEXT_PUBLIC_FAT_ZEBRA_BASE_URL` - Public gateway base URL

## Technologies

- **Next.js 16** - React framework
- **React 19** - UI library
- **Fat Zebra SDK** - Payment processing SDK
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## License

This project is for demonstration purposes only.

## Support

For Fat Zebra API documentation and support, visit [Fat Zebra Documentation](https://docs.fat.zebra).