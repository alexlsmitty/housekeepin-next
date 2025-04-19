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
  InputAdornment,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  SelectChangeEvent
} from '@mui/material';
import { supabase } from '@/lib/supabase/client';
import { useHousehold } from '@/lib/hooks/useHousehold';
import { validateForm, validateRequired, validatePositiveNumber } from '@/lib/utils/validation';
import { BudgetCategory, Budget } from '@/types/database';

interface CategoryFormProps {
  open: boolean;
  onClose: (shouldRefresh: boolean) => void;
  category: BudgetCategory | null;
}

interface FormState {
  name: string;
  description: string;
  monthly_limit: string;
  color: string;
  category_type: string;
  budget_id: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CategoryForm({ open, onClose, category }: CategoryFormProps) {
  const { household } = useHousehold();
  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    monthly_limit: '',
    color: '#3f51b5', // Default color
    category_type: 'general',
    budget_id: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetsLoading, setBudgetsLoading] = useState(false);
  
  // Fetch budgets when component opens
  useEffect(() => {
    const fetchBudgets = async () => {
      if (!household || !open) return;
      
      try {
        setBudgetsLoading(true);
        
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('household_id', household.id)
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        setBudgets(data || []);
      } catch (err) {
        console.error('Error fetching budgets:', err);
        setError('Failed to load budgets. ' + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setBudgetsLoading(false);
      }
    };
    
    fetchBudgets();
  }, [household, open]);

  // Populate form with category data if editing
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        monthly_limit: category.monthly_limit ? category.monthly_limit.toString() : '',
        color: category.color || '#3f51b5',
        category_type: category.category_type || 'general',
        budget_id: category.budget_id || ''
      });
    } else {
      // Reset form for new category
      setFormData({
        name: '',
        description: '',
        monthly_limit: '',
        color: '#3f51b5',
        category_type: 'general',
        budget_id: ''
      });
    }
    // Clear errors when form opens
    setFormErrors({});
    setError(null);
  }, [category, open]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  
  // Separate handler for Select components
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
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
  
  const validateFormData = () => {
    const rules: {[key: string]: (value: string) => boolean} = {
      name: validateRequired
    };
    
    // Only validate monthly_limit if provided
    if (formData.monthly_limit) {
      rules.monthly_limit = validatePositiveNumber;
    }
    
    // Validate budget_id if category type is 'budget'
    const errors = validateForm(formData, rules);
    
    // Custom validation for budget_id
    if (formData.category_type === 'budget' && !formData.budget_id) {
      errors.budget_id = 'Please select a budget';
    }
    
    setFormErrors(errors);
    
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!household) return;
    
    // Validate form
    if (!validateFormData()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare data for submission
      const categoryData = {
        name: formData.name,
        description: formData.description,
        monthly_limit: formData.monthly_limit ? parseFloat(formData.monthly_limit) : null,
        color: formData.color,
        household_id: household.id,
        category_type: formData.category_type,
        budget_id: formData.category_type === 'budget' && formData.budget_id ? formData.budget_id : null
      };
      
      if (category) {
        // Update existing category
        const { error } = await supabase
          .from('budget_categories')
          .update(categoryData)
          .eq('id', category.id);
          
        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('budget_categories')
          .insert([categoryData]);
          
        if (error) throw error;
      }
      
      onClose(true); // Close with refresh flag
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="sm" fullWidth>
      <DialogTitle>{category ? 'Edit Category' : 'Create New Category'}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            autoFocus
            error={!!formErrors.name}
            helperText={formErrors.name || ''}
          />
          
          <TextField
            margin="normal"
            fullWidth
            id="description"
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
          
          <FormControl component="fieldset" margin="normal" fullWidth>
            <Typography variant="subtitle2" gutterBottom>Category Type</Typography>
            <RadioGroup
              name="category_type"
              value={formData.category_type}
              onChange={handleInputChange}
              row
            >
              <FormControlLabel value="general" control={<Radio />} label="General Category" />
              <FormControlLabel value="budget" control={<Radio />} label="Budget Category" />
            </RadioGroup>
          </FormControl>

          {formData.category_type === 'budget' && (
            <FormControl fullWidth margin="normal">
              <InputLabel id="budget-select-label">Associated Budget</InputLabel>
              <Select
                labelId="budget-select-label"
                id="budget_id"
                name="budget_id"
                value={formData.budget_id}
                onChange={handleSelectChange}
                label="Associated Budget"
                disabled={budgetsLoading}
                error={!!formErrors.budget_id}
              >
                <MenuItem value="">
                  <em>Select a budget</em>
                </MenuItem>
                {budgets.map((budget) => (
                  <MenuItem key={budget.id} value={budget.id}>
                    {`${budget.name} ($${parseFloat(budget.total_amount.toString()).toFixed(2)})`}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.budget_id && <FormHelperText error>{formErrors.budget_id}</FormHelperText>}
              {budgetsLoading && <FormHelperText>Loading budgets...</FormHelperText>}
              {!budgetsLoading && budgets.length === 0 && (
                <FormHelperText error>No budgets available. Please create a budget first.</FormHelperText>
              )}
            </FormControl>
          )}
          
          <TextField
            margin="normal"
            fullWidth
            id="monthly_limit"
            label="Monthly Budget Limit"
            name="monthly_limit"
            type="number"
            value={formData.monthly_limit}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            error={!!formErrors.monthly_limit}
            helperText={formErrors.monthly_limit || ''}
          />
          
          <TextField
            margin="normal"
            fullWidth
            id="color"
            label="Category Color"
            name="color"
            type="color"
            value={formData.color}
            onChange={handleInputChange}
            sx={{ 
              '& input[type="color"]': {
                width: '100%',
                height: '50px',
                padding: '5px',
              }
            }}
          />
          
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
          disabled={loading || !formData.name}
        >
          {loading ? <CircularProgress size={24} /> : category ? 'Update Category' : 'Create Category'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}