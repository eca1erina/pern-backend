/*
  # Complete Personal Finance Database Schema

  1. New Tables
    - `profiles` - User profile information with preferences
    - `categories` - Transaction categories (income/expense) with colors
    - `transactions` - Financial transactions with categorization
    - `budgets` - Monthly budget limits per category
    - `savings_goals` - User savings targets with progress tracking
    - `bank_accounts` - Connected bank accounts (for future use)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data

  3. Functions
    - `get_category_spent` - Calculate spent amount for category in specific month/year
    - `get_budget_status` - Get budget status with spending analysis
    - `get_monthly_summary` - Get monthly transaction summary

  4. Views
    - `monthly_spending_summary` - Aggregated monthly spending data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  preferred_currency text DEFAULT 'USD',
  notification_preferences jsonb DEFAULT '{"budget_alerts": true, "goal_reminders": true}',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  color text DEFAULT '#6366f1',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name, type)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  description text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  is_recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL CHECK (year >= 2020),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category_id, month, year)
);

-- Create savings_goals table
CREATE TABLE IF NOT EXISTS savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  target_amount decimal(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount decimal(12,2) DEFAULT 0 CHECK (current_amount >= 0),
  target_date date,
  is_achieved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bank_accounts table (for future use)
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit')),
  balance decimal(12,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  last_synced timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for categories
CREATE POLICY "Users can read own categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for budgets
CREATE POLICY "Users can read own budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for savings_goals
CREATE POLICY "Users can read own savings goals"
  ON savings_goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings goals"
  ON savings_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings goals"
  ON savings_goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings goals"
  ON savings_goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for bank_accounts
CREATE POLICY "Users can read own bank accounts"
  ON bank_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts"
  ON bank_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts"
  ON bank_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts"
  ON bank_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON budgets(month, year);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_id ON bank_accounts(user_id);

-- Function to calculate spent amount for a category in a specific month/year
CREATE OR REPLACE FUNCTION get_category_spent(
  p_user_id uuid,
  p_category_id uuid,
  p_month integer,
  p_year integer
)
RETURNS decimal AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(amount)
     FROM transactions
     WHERE user_id = p_user_id
       AND category_id = p_category_id
       AND type = 'expense'
       AND EXTRACT(MONTH FROM transaction_date) = p_month
       AND EXTRACT(YEAR FROM transaction_date) = p_year),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get budget status
CREATE OR REPLACE FUNCTION get_budget_status(
  p_user_id uuid,
  p_month integer,
  p_year integer
)
RETURNS TABLE(
  category_id uuid,
  category_name text,
  budgeted_amount decimal,
  spent_amount decimal,
  remaining_amount decimal,
  percentage_used decimal,
  is_over_budget boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.category_id,
    c.name as category_name,
    b.amount as budgeted_amount,
    get_category_spent(p_user_id, b.category_id, p_month, p_year) as spent_amount,
    (b.amount - get_category_spent(p_user_id, b.category_id, p_month, p_year)) as remaining_amount,
    CASE 
      WHEN b.amount > 0 THEN 
        (get_category_spent(p_user_id, b.category_id, p_month, p_year) / b.amount * 100)
      ELSE 0
    END as percentage_used,
    (get_category_spent(p_user_id, b.category_id, p_month, p_year) > b.amount) as is_over_budget
  FROM budgets b
  JOIN categories c ON b.category_id = c.id
  WHERE b.user_id = p_user_id
    AND b.month = p_month
    AND b.year = p_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly summary
CREATE OR REPLACE FUNCTION get_monthly_summary(
  p_user_id uuid,
  p_month integer,
  p_year integer
)
RETURNS TABLE(
  total_income decimal,
  total_expenses decimal,
  net_amount decimal,
  transaction_count bigint,
  top_expense_category text,
  top_expense_amount decimal
) AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
      COUNT(*) as tx_count
    FROM transactions t
    WHERE t.user_id = p_user_id
      AND EXTRACT(MONTH FROM t.transaction_date) = p_month
      AND EXTRACT(YEAR FROM t.transaction_date) = p_year
  ),
  top_category AS (
    SELECT 
      c.name,
      SUM(t.amount) as amount
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = p_user_id
      AND t.type = 'expense'
      AND EXTRACT(MONTH FROM t.transaction_date) = p_month
      AND EXTRACT(YEAR FROM t.transaction_date) = p_year
    GROUP BY c.name
    ORDER BY SUM(t.amount) DESC
    LIMIT 1
  )
  SELECT 
    COALESCE(md.income, 0) as total_income,
    COALESCE(md.expenses, 0) as total_expenses,
    COALESCE(md.income, 0) - COALESCE(md.expenses, 0) as net_amount,
    COALESCE(md.tx_count, 0) as transaction_count,
    COALESCE(tc.name, '') as top_expense_category,
    COALESCE(tc.amount, 0) as top_expense_amount
  FROM monthly_data md
  FULL OUTER JOIN top_category tc ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for monthly spending summary (now that tables exist)
CREATE OR REPLACE VIEW monthly_spending_summary AS
SELECT 
  t.user_id,
  EXTRACT(YEAR FROM t.transaction_date) as year,
  EXTRACT(MONTH FROM t.transaction_date) as month,
  t.category_id,
  c.name as category_name,
  c.type as category_type,
  SUM(t.amount) as total_amount,
  COUNT(t.id) as transaction_count
FROM transactions t
JOIN categories c ON t.category_id = c.id
GROUP BY t.user_id, EXTRACT(YEAR FROM t.transaction_date), EXTRACT(MONTH FROM t.transaction_date), t.category_id, c.name, c.type;

-- Insert default categories for new users (trigger function)
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default expense categories
  INSERT INTO categories (user_id, name, type, color, is_default) VALUES
    (NEW.id, 'Food & Dining', 'expense', '#ef4444', true),
    (NEW.id, 'Transportation', 'expense', '#f97316', true),
    (NEW.id, 'Shopping', 'expense', '#eab308', true),
    (NEW.id, 'Entertainment', 'expense', '#22c55e', true),
    (NEW.id, 'Bills & Utilities', 'expense', '#3b82f6', true),
    (NEW.id, 'Healthcare', 'expense', '#8b5cf6', true),
    (NEW.id, 'Education', 'expense', '#ec4899', true),
    (NEW.id, 'Travel', 'expense', '#06b6d4', true),
    (NEW.id, 'Other Expenses', 'expense', '#6b7280', true);
  
  -- Insert default income categories
  INSERT INTO categories (user_id, name, type, color, is_default) VALUES
    (NEW.id, 'Salary', 'income', '#10b981', true),
    (NEW.id, 'Freelance', 'income', '#059669', true),
    (NEW.id, 'Investment', 'income', '#047857', true),
    (NEW.id, 'Other Income', 'income', '#065f46', true);
  
  -- Create default profile
  INSERT INTO profiles (id, full_name, preferred_currency, onboarding_completed)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'USD', false)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create default categories and profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_categories();

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_savings_goals_updated_at
  BEFORE UPDATE ON savings_goals
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();