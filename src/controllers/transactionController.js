const supabase = require('../config/supabase');

const getTransactions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      category_id, 
      type, 
      start_date, 
      end_date 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('transactions')
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
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (start_date) {
      query = query.gte('transaction_date', start_date);
    }

    if (end_date) {
      query = query.lte('transaction_date', end_date);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { 
      category_id, 
      amount, 
      description, 
      transaction_date, 
      type,
      is_recurring = false 
    } = req.body;

    if (!category_id || !amount || !type) {
      return res.status(400).json({ 
        error: 'Category ID, amount, and type are required' 
      });
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: req.user.id,
        category_id,
        amount: parseFloat(amount),
        description,
        transaction_date: transaction_date || new Date().toISOString().split('T')[0],
        type,
        is_recurring
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
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      category_id, 
      amount, 
      description, 
      transaction_date, 
      is_recurring 
    } = req.body;

    const { data, error } = await supabase
      .from('transactions')
      .update({
        category_id,
        amount: amount ? parseFloat(amount) : undefined,
        description,
        transaction_date,
        is_recurring
      })
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
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTransactionSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month || (currentDate.getMonth() + 1);
    const targetYear = year || currentDate.getFullYear();

    const { data, error } = await supabase
      .rpc('get_monthly_summary', {
        p_user_id: req.user.id,
        p_month: parseInt(targetMonth),
        p_year: parseInt(targetYear)
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Get transaction summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary
};