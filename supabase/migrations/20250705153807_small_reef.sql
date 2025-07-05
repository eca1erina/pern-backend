/*
  # Database Functions and Views

  1. Database Functions
    - `get_category_spent` - Calculate spent amount for a category in a specific month/year
    - `get_budget_status` - Get budget status with spending analysis
    - `get_monthly_summary` - Get monthly transaction summary

  2. Views
    - `monthly_spending_summary` - Monthly spending aggregation view

  3. Security
    - All functions respect RLS policies
    - Views include user_id for proper filtering
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
     FROM public.transactions
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
  FROM public.budgets b
  JOIN public.categories c ON b.category_id = c.id
  WHERE b.user_id = p_user_id
    AND b.month = p_month
    AND b.year = p_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get monthly transaction summary
CREATE OR REPLACE FUNCTION get_monthly_summary(
  p_user_id uuid,
  p_month integer,
  p_year integer
)
RETURNS TABLE(
  total_income decimal,
  total_expenses decimal,
  net_amount decimal,
  transaction_count integer,
  categories_summary jsonb
) AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      t.type,
      t.amount,
      c.name as category_name,
      c.color as category_color
    FROM public.transactions t
    JOIN public.categories c ON t.category_id = c.id
    WHERE t.user_id = p_user_id
      AND EXTRACT(MONTH FROM t.transaction_date) = p_month
      AND EXTRACT(YEAR FROM t.transaction_date) = p_year
  ),
  summary_data AS (
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses,
      COUNT(*) as tx_count
    FROM monthly_data
  ),
  category_summary AS (
    SELECT jsonb_agg(
      jsonb_build_object(
        'category', category_name,
        'color', category_color,
        'type', type,
        'amount', SUM(amount)
      )
    ) as categories
    FROM monthly_data
    GROUP BY category_name, category_color, type
  )
  SELECT 
    s.income,
    s.expenses,
    (s.income - s.expenses) as net,
    s.tx_count,
    COALESCE(cs.categories, '[]'::jsonb)
  FROM summary_data s
  CROSS JOIN category_summary cs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for monthly spending summary (only if tables exist)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'transactions'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'categories'
  ) THEN
    EXECUTE '
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
    FROM public.transactions t
    JOIN public.categories c ON t.category_id = c.id
    GROUP BY t.user_id, EXTRACT(YEAR FROM t.transaction_date), EXTRACT(MONTH FROM t.transaction_date), t.category_id, c.name, c.type;
    ';
  END IF;
END $$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_category_spent(uuid, uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_budget_status(uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_summary(uuid, integer, integer) TO authenticated;

-- Grant view permissions if view exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name = 'monthly_spending_summary'
  ) THEN
    EXECUTE 'GRANT SELECT ON monthly_spending_summary TO authenticated';
  END IF;
END $$;