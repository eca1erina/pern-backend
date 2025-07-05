/*
  # Budget Tracking Functions

  1. Functions for budget calculations
    - Calculate spent amount for a category in a given month/year
    - Get budget status (remaining, percentage used)
    - Check if budget limit is exceeded

  2. Views for easy querying
    - Budget overview with spent amounts
    - Monthly spending summary
*/

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
$$ LANGUAGE plpgsql;

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
$$ LANGUAGE plpgsql;

-- Create view for monthly spending summary
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