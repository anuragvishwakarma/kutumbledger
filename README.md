# Kutumbledger - Family Finance Management App

A Next.js + Supabase family finance management application built with Hermes Agent.

## Features

- **Transactions**: Track income and expenses with categories
- **Accounts**: Manage family members with secure invitation system
- **Budgets**: Set and track budget goals by category
- **Goals**: Save towards specific financial targets
- **Money Jars**: Implement save/spend/give/invest jar system
- **Domestic Helpers**: Manage household staff information
- **Festival Plans**: Plan and track festival expenses
- **Udhaar Records**: Track lending/borrowing within family
- **Reports**: View financial analytics and export reports

## Tech Stack

- **Framework**: Next.js 16.3.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Forms**: React Hook Form (via shadcn/ui)
- **Notifications**: Sonner

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kutumbledger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` to add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**
   The Supabase schema migrations are included in the `supabase/migrations` folder.
   You can apply them using the Supabase CLI or through the Supabase dashboard.

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t kutumbledger .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 --env-file .env.local kutumbledger
   ```

### Vercel Deployment

This application is ready to deploy on Vercel:
1. Push the repository to GitHub
2. Import the project on Vercel
3. Add the environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Deploy!

## Development

### Project Structure

```
/app - Next.js pages and route handlers
/components - Reusable UI components
/lib - Utility functions and Supabase client
/supabase - Database migrations
/public - Static assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (to be implemented)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built with [Hermes Agent](https://hermes-agent.nousresearch.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Heroicons](https://heroicons.com)


---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
