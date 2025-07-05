/*
  # Create Default Categories for New Users

  1. Function to create default categories
    - Creates standard income and expense categories for new users
    - Triggered when a new profile is created

  2. Default Categories
    - Income: Salary, Freelance, Investment, Other Income
    - Expense: Food, Transportation, Housing, Entertainment, Healthcare, Shopping, Bills, Other Expense
*/

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default income categories
  INSERT INTO categories (user_id, name, type, color, is_default) VALUES
    (NEW.id, 'Salary', 'income', '#10b981', true),
    (NEW.id, 'Freelance', 'income', '#059669', true),
    (NEW.id, 'Investment', 'income', '#047857', true),
    (NEW.id, 'Other Income', 'income', '#065f46', true);

  -- Create default expense categories
  INSERT INTO categories (user_id, name, type, color, is_default) VALUES
    (NEW.id, 'Food & Dining', 'expense', '#ef4444', true),
    (NEW.id, 'Transportation', 'expense', '#f97316', true),
    (NEW.id, 'Housing', 'expense', '#eab308', true),
    (NEW.id, 'Entertainment', 'expense', '#a855f7', true),
    (NEW.id, 'Healthcare', 'expense', '#ec4899', true),
    (NEW.id, 'Shopping', 'expense', '#06b6d4', true),
    (NEW.id, 'Bills & Utilities', 'expense', '#6366f1', true),
    (NEW.id, 'Other Expense', 'expense', '#64748b', true);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create default categories for new users
CREATE TRIGGER create_default_categories_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();