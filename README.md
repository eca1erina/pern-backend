# Personal Finance Management API

A comprehensive RESTful API for personal finance management built with Node.js, Express, and Supabase.

## Features

- **User Authentication & Profiles**: Secure user management with Supabase Auth
- **Transaction Management**: Track income and expenses with categorization
- **Budget Management**: Set and monitor monthly budgets per category
- **Savings Goals**: Create and track progress toward financial goals
- **Categories**: Organize transactions with customizable categories
- **Real-time Analytics**: Budget status and spending summaries
- **Bank Integration Ready**: Prepared for future bank account connections

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Environment**: dotenv for configuration

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Supabase account and project

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Supabase**:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to Settings > API to get your project URL and keys
   - Run the migration files in the `supabase/migrations/` folder in your Supabase SQL editor

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
All endpoints (except `/health`) require authentication via Bearer token in the Authorization header.

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/complete-onboarding` - Mark onboarding as complete

### Categories
- `GET /api/categories` - Get user categories (optional: `?type=income|expense`)
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Transactions
- `GET /api/transactions` - Get transactions (with pagination and filters)
- `GET /api/transactions/summary` - Get monthly transaction summary
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get budgets for specific month/year
- `GET /api/budgets/status` - Get budget status with spending analysis
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Savings Goals
- `GET /api/savings-goals` - Get all savings goals
- `POST /api/savings-goals` - Create new savings goal
- `PUT /api/savings-goals/:id` - Update savings goal
- `DELETE /api/savings-goals/:id` - Delete savings goal
- `POST /api/savings-goals/:id/add` - Add money to savings goal

## Database Schema

The application uses the following main tables:

- **profiles**: User profile information
- **categories**: Transaction categories (income/expense)
- **transactions**: Financial transactions
- **budgets**: Monthly budget limits per category
- **savings_goals**: User savings targets
- **bank_accounts**: Connected bank accounts (for future use)

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- JWT token validation for all protected routes
- Input validation and sanitization

## Development

### Project Structure
```
src/
├── config/          # Database and service configurations
├── controllers/     # Route handlers and business logic
├── middleware/      # Authentication and other middleware
├── routes/          # API route definitions
└── index.js         # Application entry point

supabase/
└── migrations/      # Database schema and functions
```

### Adding New Features

1. Create database migrations in `supabase/migrations/`
2. Add controllers in `src/controllers/`
3. Define routes in `src/routes/`
4. Update the main app in `src/index.js`

## Frontend Integration

This API is designed to work with any frontend framework. For authentication:

1. Use Supabase client-side authentication
2. Send the JWT token in the Authorization header: `Bearer <token>`
3. Handle token refresh as needed

Example frontend setup:
```javascript
// Frontend authentication example
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// After login, use the token for API calls
const { data: { session } } = await supabase.auth.getSession()
const token = session?.access_token

// API call example
fetch('http://localhost:3001/api/transactions', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License