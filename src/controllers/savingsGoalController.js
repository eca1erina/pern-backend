const supabase = require('../config/supabase');

const getSavingsGoals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Get savings goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createSavingsGoal = async (req, res) => {
  try {
    const { name, target_amount, target_date, current_amount = 0 } = req.body;

    if (!name || !target_amount) {
      return res.status(400).json({ 
        error: 'Name and target amount are required' 
      });
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: req.user.id,
        name,
        target_amount: parseFloat(target_amount),
        current_amount: parseFloat(current_amount),
        target_date
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create savings goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateSavingsGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, target_amount, target_date, current_amount } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (target_amount !== undefined) updateData.target_amount = parseFloat(target_amount);
    if (target_date !== undefined) updateData.target_date = target_date;
    if (current_amount !== undefined) {
      updateData.current_amount = parseFloat(current_amount);
      // Check if goal is achieved
      if (target_amount && parseFloat(current_amount) >= parseFloat(target_amount)) {
        updateData.is_achieved = true;
      }
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update savings goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteSavingsGoal = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete savings goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addToSavingsGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Get current goal
    const { data: goal, error: fetchError } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (fetchError || !goal) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    const newAmount = parseFloat(goal.current_amount) + parseFloat(amount);
    const isAchieved = newAmount >= parseFloat(goal.target_amount);

    const { data, error } = await supabase
      .from('savings_goals')
      .update({
        current_amount: newAmount,
        is_achieved: isAchieved
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Add to savings goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addToSavingsGoal
};