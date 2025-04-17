'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Grid,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { supabase } from '@/lib/supabase/client';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { useAuthContext } from '@/components/AuthProvider';
import { validateForm, validateRequired, validatePositiveNumber, validateDate } from '@/lib/utils/validation';

export default function TransactionForm({ open, onClose, transaction }) {
  const { household } = useHousehold();
  const { user } = useAuthContext();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date(),
    category_id: '',
    transaction_type: 'expense' // Add transaction_type with default value
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch categories with budget information
  useEffect(() => {
    const fetchCategories = async () => {
      if (!household) return;
      
      try {
        setCategoriesLoading(true);
        
        // Fetch categories with budget information
        const { data, error } = await supabase
          .from('budget_categories')
          .select('*, budgets:budget_id(id, name)')
          .eq('household_id', household.id)
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (open && household) {
      fetchCategories();
    }
  }, [household, open]);
  
  // Populate form with transaction data if editing
  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount ? transaction.amount.toString() : '',
        description: transaction.description || '',
        date: transaction.date ? new Date(transaction.date) : new Date(),
        category_id: transaction.category_id || '',
        transaction_type: transaction.transaction_type || 'expense'
      });
    } else {
      // Reset form for new transaction
      setFormData({
        amount: '',
        description: '',
        date: new Date(),
        category_id: '',
        transaction_type: 'expense'
      });
    }
    // Clear errors when form opens
    setFormErrors({});
    setError(null);
  }, [transaction, open, categories]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date
    });
    
    // Clear error for date field
    if (formErrors.date) {
      setFormErrors({
        ...formErrors,
        date: ''
      });
    }
  };
  
  const validateFormData = () => {
    const rules = {
      amount: validatePositiveNumber,
      date: validateDate
    };
    
    const errors = validateForm(formData, rules);
    setFormErrors(errors);
    
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!household || !user) return;
    
    // Validate form
    if (!validateFormData()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate amount
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Prepare data for submission
      const transactionData = {
        amount,
        description: formData.description,
        date: formData.date.toISOString(),
        category_id: formData.category_id || null,
        household_id: household.id,
        created_by: user.id,
        transaction_type: formData.transaction_type || 'expense' // Add transaction_type field
      };
      
      if (transaction) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update(transactionData)
          .eq('id', transaction.id);
          
        if (error) throw error;
      } else {
        // Create new transaction
        const { error } = await supabase
          .from('transactions')
          .insert([transactionData]);
          
        if (error) throw error;
      }
      
      onClose(true); // Close with refresh flag
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
                <Select
                  labelId="transaction-type-label"
                  id="transaction_type"
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleInputChange}
                  label="Transaction Type"
                >
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="amount"
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                error={!!formErrors.amount}
                helperText={formErrors.amount || ''}
                autoFocus
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  sx={{ width: '100%' }}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      error: !!formErrors.date,
                      helperText: formErrors.date || '' 
                    } 
                  }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  label="Category"
                  disabled={categoriesLoading}
                >
                  <MenuItem value="">
                    <em>Uncategorized</em>
                  </MenuItem>
                  
                  {/* Budget categories */}
                  {categories.filter(cat => cat.category_type === 'budget' && cat.budget_id).length > 0 && (
                    <li className="MuiListSubheader-root" style={{fontWeight: 'bold', lineHeight: '30px'}}>
                      Budget Categories
                    </li>
                  )}
                  {categories
                    .filter(cat => cat.category_type === 'budget' && cat.budget_id)
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name} {category.budgets && ` - ${category.budgets.name}`}
                      </MenuItem>
                    ))
                  }
                  
                  {/* General categories */}
                  {categories.filter(cat => cat.category_type === 'general' || !cat.category_type).length > 0 && (
                    <li className="MuiListSubheader-root" style={{fontWeight: 'bold', lineHeight: '30px'}}>
                      General Categories
                    </li>
                  )}
                  {categories
                    .filter(cat => cat.category_type === 'general' || !cat.category_type)
                    .map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || !formData.amount}
        >
          {loading ? <CircularProgress size={24} /> : transaction ? 'Update Transaction' : 'Add Transaction'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
