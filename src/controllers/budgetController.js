const supabase = require('../config/supabase');

const getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || (currentDate.getMonth() + 1);
    const targetYear = year || currentDate.getFullYear();

    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color
        )
      `)
      .eq('user_id', req.user.id)
      .eq('month', parseInt(targetMonth))
      .eq('year', parseInt(targetYear))
      .order('created_at');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createBudget = async (req, res) => {
  try {
    const { category_id, amount, month, year } = req.body;

    if (!category_id || !amount || !month || !year) {
      return res.status(400).json({ 
        error: 'Category ID, amount, month, and year are required' 
      });
    }

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: req.user.id,
        category_id,
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year)
      })
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const { data, error } = await supabase
      .from('budgets')
      .update({ amount: parseFloat(amount) })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select(`
        *,
        categories (
          id,
          name,
          type,
          color
        )
      `)
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBudgetStatus = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || (currentDate.getMonth() + 1);
    const targetYear = year || currentDate.getFullYear();

    const { data, error } = await supabase
      .rpc('get_budget_status', {
        p_user_id: req.user.id,
        p_month: parseInt(targetMonth),
        p_year: parseInt(targetYear)
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Get budget status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus
};