'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  LinearProgress,
  Button,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase/client';
import { useHousehold } from '@/lib/hooks/useHousehold';
import CategoryForm from '@/components/budget/CategoryForm';
import { useAuthContext } from '@/components/AuthProvider';
import { PostgrestError } from '@supabase/supabase-js';
import { BudgetCategory, Transaction as TransactionType, Budget as BudgetType, Category } from '@/types/database';
import { safeCast, toNumber, toString } from '@/lib/utils/typesafe';

// Define interfaces for data types (extended from base types if needed)
interface Transaction extends TransactionType {
  budget_categories?: {
    name: string;
  };
}

// Use the imported BudgetType directly

interface BudgetStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

interface FormErrors {
  [key: string]: string;
}

interface BudgetFormData {
  name: string;
  start_date: string;
  end_date: string;
  total_amount: string;
}

interface CategoryFormData {
  name: string;
  description: string;
}

interface TransactionFormData {
  category_id: string;
  transaction_type: 'expense' | 'income';
  amount: string;
  description: string;
}

interface BudgetOverviewProps {
  onAddCategory?: () => void;
  onAddTransaction?: () => void;
}

export default function BudgetOverview({ onAddCategory, onAddTransaction }: BudgetOverviewProps = {}) {
  const { household } = useHousehold();
  const { user } = useAuthContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [stats, setStats] = useState<BudgetStats>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  
  // Form states
  const [newBudget, setNewBudget] = useState<BudgetFormData>({
    name: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
    total_amount: ''
  });
  
  const [newCategory, setNewCategory] = useState<CategoryFormData>({
    name: '',
    description: ''
  });
  
  const [newTransaction, setNewTransaction] = useState<TransactionFormData>({
    category_id: '',
    transaction_type: 'expense',
    amount: '',
    description: ''
  });

  // Load budget data
  const fetchBudgetData = async () => {
    if (!household) return;
    
    try {
      setLoading(true);
      
      // Fetch categories with budget information
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('budget_categories')
        .select('*, budgets:budget_id(id, name, total_amount)')
        .eq('household_id', household.id);
      
      if (categoriesError) throw categoriesError;
      
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*, budget_categories(name)')
        .eq('household_id', household.id)
        .order('created_at', { ascending: false });
      
      if (transactionsError) throw transactionsError;
      
      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('household_id', household.id)
        .order('created_at', { ascending: false });
      
      if (budgetsError) throw budgetsError;
      
      const typedCategories = categoriesData ? categoriesData.map(cat => cat as unknown as Category) : [];
      const typedTransactions = transactionsData ? transactionsData.map(trans => trans as unknown as Transaction) : [];
      const typedBudgets = budgetsData ? budgetsData.map(budget => budget as unknown as BudgetType) : [];
      
      setCategories(typedCategories);
      setTransactions(typedTransactions);
      setBudgets(typedBudgets);
      
      // Calculate statistics
      if (transactionsData) {
        const income = transactionsData
          .filter(t => t.transaction_type === 'income')
          .reduce((sum, t) => sum + toNumber(t.amount, 0), 0);
          
        const expenses = transactionsData
          .filter(t => t.transaction_type === 'expense')
          .reduce((sum, t) => sum + toNumber(t.amount, 0), 0);
        
        // Calculate total budget amount
        const totalBudget = typedBudgets.reduce(
          (sum, b) => sum + toNumber(b.total_amount, 0), 0
        );
          
        // Balance calculation: (Sum of budgets) + (income - expenses)
        const netIncome = income - expenses;
        const balance = totalBudget + netIncome;
          
        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          balance: balance
        });
      }
    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading budget data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchBudgetData();
  }, [household]);

  // Form handlers
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setNewBudget(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setNewCategory(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setNewTransaction(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Special handlers for Select components
  const handleTransactionTypeChange = (event: SelectChangeEvent<'income' | 'expense'>) => {
    setNewTransaction(prev => ({
      ...prev,
      transaction_type: event.target.value as 'income' | 'expense'
    }));
  };
  
  const handleCategorySelectChange = (event: SelectChangeEvent<string>) => {
    setNewTransaction(prev => ({
      ...prev,
      category_id: event.target.value
    }));
  };

  // Submit handlers
  const handleBudgetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!household) {
      setError("No household found. Please create or join a household first.");
      return;
    }
    
    try {
      // Create the budget data object with proper types
      const budgetData = {
        household_id: household.id,
        name: newBudget.name,
        start_date: newBudget.start_date,
        end_date: newBudget.end_date,
        total_amount: parseFloat(newBudget.total_amount) || 0
      };
      
      const { error } = await supabase
        .from('budgets')
        .insert(budgetData);
        
      if (error) throw error;
      
      // Refresh budgets
      if (household) {
        const { data: updatedBudgets, error: refreshError } = await supabase
          .from('budgets')
          .select('*')
          .eq('household_id', household.id)
          .order('created_at', { ascending: false });
          
        if (refreshError) throw refreshError;
        
        // Safe type casting
        if (updatedBudgets) {
          setBudgets(updatedBudgets.map(budget => budget as unknown as BudgetType));
        }
      }
      
      // Reset form and close modal
      setNewBudget({
        name: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
        total_amount: ''
      });
      setShowBudgetModal(false);
      
    } catch (err) {
      console.error('Error creating budget:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Failed to create budget';
      setError(errorMessage);
    }
  };
  
  const handleTransactionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!household || !user) {
      setError("No household or user found. Please ensure you're logged in and have a household.");
      return;
    }
    
    try {
      // Create the transaction data with proper types
      const transactionData = {
        household_id: household.id,
        category_id: newTransaction.category_id || null,
        transaction_type: newTransaction.transaction_type,
        amount: parseFloat(newTransaction.amount) || 0,
        description: newTransaction.description,
        created_by: user.id
      };
      
      const { error } = await supabase
        .from('transactions')
        .insert(transactionData);
        
      if (error) throw error;
      
      // Refresh transactions
      if (household) {
        const { data: updatedTransactions, error: refreshError } = await supabase
          .from('transactions')
          .select('*, budget_categories(name)')
          .eq('household_id', household.id)
          .order('created_at', { ascending: false });
          
        if (refreshError) throw refreshError;
        
        if (updatedTransactions) {
          // Safe type casting
          const typedTransactions = updatedTransactions.map(trans => trans as Transaction);
          setTransactions(typedTransactions);
          
          // Update statistics
          const income = typedTransactions
            .filter(t => t.transaction_type === 'income')
            .reduce((sum, t) => sum + toNumber(t.amount, 0), 0);
            
          const expenses = typedTransactions
            .filter(t => t.transaction_type === 'expense')
            .reduce((sum, t) => sum + toNumber(t.amount, 0), 0);
          
          // Calculate total budget amount
          const totalBudget = budgets.reduce(
            (sum, b) => sum + toNumber(b.total_amount, 0), 0
          );
          
          // Balance calculation
          const netIncome = income - expenses;
          const balance = totalBudget + netIncome;
            
          setStats({
            totalIncome: income,
            totalExpenses: expenses,
            balance: balance
          });
        }
      }
      
      // Reset form and close modal
      setNewTransaction({
        category_id: '',
        transaction_type: 'expense',
        amount: '',
        description: ''
      });
      setShowTransactionModal(false);
      
    } catch (err) {
      console.error('Error creating transaction:', err);
      const errorMessage = err instanceof PostgrestError ? err.message : 'Failed to create transaction';
      setError(errorMessage);
    }
  };
  
  // Handle editing a category
  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setShowCategoryModal(true);
  };
  
  // Handle closing the category form
  const handleCloseCategoryForm = (shouldRefresh: boolean = false) => {
    setShowCategoryModal(false);
    setCurrentCategory(null);
    
    if (shouldRefresh) {
      // Refresh data
      fetchBudgetData();
    }
  };
  
  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: 'success.light', height: '100%' }}>
            <Typography variant="h6" gutterBottom>Total Income</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.dark' }}>
              ${stats.totalIncome.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: 'error.light', height: '100%' }}>
            <Typography variant="h6" gutterBottom>Total Expenses</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.dark' }}>
              ${stats.totalExpenses.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: stats.balance >= 0 ? 'info.light' : 'warning.light', height: '100%' }}>
            <Typography variant="h6" gutterBottom>Balance</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: stats.balance >= 0 ? 'info.dark' : 'warning.dark' }}>
              ${stats.balance.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          onClick={() => {
            setCurrentCategory(null);
            setShowCategoryModal(true);
          }}
        >
          Add Category
        </Button>
        
        <Button 
          variant="outlined" 
          startIcon={<AddIcon />}
          onClick={() => setShowBudgetModal(true)}
        >
          Create Budget
        </Button>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setShowTransactionModal(true)}
        >
          Add Transaction
        </Button>
      </Box>
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" />
          <Tab label="Transactions" />
          <Tab label="Budgets" />
          <Tab label="Categories" />
        </Tabs>
        
        {/* Overview Tab */}
        {activeTab === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
            
            {transactions.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', mt: 2 }}>
                No transactions yet. Add your first transaction to get started.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.slice(0, 5).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.description || 'No description'}</TableCell>
                        <TableCell>{transaction.budget_categories?.name || 'Uncategorized'}</TableCell>
                        <TableCell>
                          <Box 
                            component="span" 
                            sx={{ 
                              bgcolor: transaction.transaction_type === 'income' ? 'success.light' : 'error.light',
                              color: transaction.transaction_type === 'income' ? 'success.dark' : 'error.dark',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              textTransform: 'capitalize'
                            }}
                          >
                            {transaction.transaction_type}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          color: transaction.transaction_type === 'income' ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}>
                          ${toNumber(transaction.amount, 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Active Budgets</Typography>
            
            {budgets.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', mt: 2 }}>
                No budgets created yet. Create your first budget to track your spending.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {budgets.slice(0, 3).map((budget) => (
                  <Grid item xs={12} md={4} key={budget.id}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {budget.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                        {format(parseISO(budget.start_date), 'MMM d, yyyy')} - {format(parseISO(budget.end_date), 'MMM d, yyyy')}
                      </Typography>
                      <Typography variant="body1">
                        Budget: <Box component="span" sx={{ fontWeight: 'bold' }}>${toNumber(budget.total_amount, 0).toFixed(2)}</Box>
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
        
        {/* Transactions Tab */}
        {activeTab === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>All Transactions</Typography>
            
            {transactions.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', mt: 2 }}>
                No transactions yet. Add your first transaction to get started.
              </Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.description || 'No description'}</TableCell>
                        <TableCell>{transaction.budget_categories?.name || 'Uncategorized'}</TableCell>
                        <TableCell>
                          <Box 
                            component="span" 
                            sx={{ 
                              bgcolor: transaction.transaction_type === 'income' ? 'success.light' : 'error.light',
                              color: transaction.transaction_type === 'income' ? 'success.dark' : 'error.dark',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              textTransform: 'capitalize'
                            }}
                          >
                            {transaction.transaction_type}
                          </Box>
                        </TableCell>
                        <TableCell align="right" sx={{ 
                          color: transaction.transaction_type === 'income' ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}>
                          ${toNumber(transaction.amount, 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(transaction.created_at), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
        
        {/* Budgets Tab */}
        {activeTab === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>All Budgets</Typography>
            
            {budgets.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', mt: 2 }}>
                No budgets created yet. Create your first budget to track your spending.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {budgets.map((budget) => {
                  // Find categories associated with this budget
                  const budgetCategories = categories.filter(cat => 
                    cat.category_type === 'budget' && cat.budget_id === budget.id
                  );
                  
                  // Calculate spent amount for this budget (transactions in budget categories)
                  const budgetCategoryIds = budgetCategories.map(cat => cat.id);
                  const budgetTransactions = transactions.filter(t => 
                    t.transaction_type === 'expense' && 
                    t.category_id && budgetCategoryIds.includes(t.category_id)
                  );
                  
                  const spentAmount = budgetTransactions.reduce(
                    (sum, t) => sum + toNumber(t.amount, 0), 0
                  );
                  
                  const budgetAmount = toNumber(budget.total_amount, 0);
                  const remainingAmount = budgetAmount - spentAmount;
                  const usagePercentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
                  
                  return (
                    <Grid item xs={12} key={budget.id}>
                      <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6">{budget.name}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {format(parseISO(budget.start_date), 'MMM d, yyyy')} - {format(parseISO(budget.end_date), 'MMM d, yyyy')}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle1">Budget Amount</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                              ${toNumber(budget.total_amount, 0).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mt: 3, mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Spent: ${spentAmount.toFixed(2)}</Typography>
                            <Typography variant="body2" sx={{ 
                              color: remainingAmount >= 0 ? 'success.main' : 'error.main',
                              fontWeight: 'bold'
                            }}>
                              Remaining: ${remainingAmount.toFixed(2)}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(usagePercentage, 100)}
                            color={remainingAmount >= 0 ? "primary" : "error"}
                            sx={{ height: 8, borderRadius: 2 }}
                          />
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                            {usagePercentage.toFixed(1)}% used
                          </Typography>
                        </Box>
                        
                        {budgetCategories.length > 0 ? (
                          <>
                            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Categories in this Budget</Typography>
                            <Grid container spacing={1}>
                              {budgetCategories.map(category => {
                                // Calculate category spending
                                const categoryTransactions = transactions.filter(t => 
                                  t.transaction_type === 'expense' && t.category_id === category.id
                                );
                                const categorySpent = categoryTransactions.reduce(
                                  (sum, t) => sum + toNumber(t.amount, 0), 0
                                );
                                
                                return (
                                  <Grid item xs={12} sm={6} md={4} key={category.id}>
                                    <Paper 
                                      elevation={0}
                                      sx={{ 
                                        p: 2, 
                                        bgcolor: 'background.paper',
                                        border: 1,
                                        borderColor: 'divider',
                                        borderLeft: 4,
                                        borderLeftColor: category.color || 'primary.main'
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="subtitle2">{category.name}</Typography>
                                        <IconButton 
                                          size="small" 
                                          color="primary" 
                                          onClick={() => handleEditCategory(category)}
                                          title="Edit Category"
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Box>
                                      <Typography variant="body2" color="text.secondary">
                                        Spent: ${categorySpent.toFixed(2)}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </>
                        ) : (
                          <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary', fontStyle: 'italic' }}>
                            No categories assigned to this budget. Add a budget category to track spending.
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        )}
        
        {/* Categories Tab */}
        {activeTab === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Budget Categories</Typography>
            
            {categories.length === 0 ? (
                              <Typography sx={{ color: 'text.secondary', mt: 2 }}>
                No categories defined. Add a category to organize your transactions.
              </Typography>
            ) : (
              <>
                {/* Budget Categories Section */}
                {categories.filter(cat => cat.category_type === 'budget' && cat.budget_id).length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
                      Budget Categories
                    </Typography>
                    <Grid container spacing={2}>
                      {categories
                        .filter(cat => cat.category_type === 'budget' && cat.budget_id)
                        .map((category) => (
                          <Grid item xs={12} sm={6} md={4} key={category.id}>
                            <Paper sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: category.color || 'primary.main' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {category.name}
                                </Typography>
                                <IconButton 
                                  size="small" 
                                  color="primary" 
                                  onClick={() => handleEditCategory(category)}
                                  title="Edit Category"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                {category.description || 'No description'}
                              </Typography>
                              <Box sx={{ 
                                bgcolor: 'background.paper', 
                                p: 1, 
                                borderRadius: 1, 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                                  Budget:
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                  {category.budgets?.name}
                                </Typography>
                              </Box>
                              {category.monthly_limit && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                                    Monthly Limit: ${toNumber(category.monthly_limit, 0).toFixed(2)}
                                  </Typography>
                                </Box>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                    </Grid>
                  </>
                )}
                
                {/* General Categories Section */}
                <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: 'bold' }}>
                  General Categories
                </Typography>
                <Grid container spacing={2}>
                  {categories
                    .filter(cat => cat.category_type === 'general' || !cat.category_type)
                    .map((category) => (
                      <Grid item xs={12} sm={6} md={4} key={category.id}>
                        <Paper sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: category.color || 'primary.main' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {category.name}
                            </Typography>
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => handleEditCategory(category)}
                              title="Edit Category"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {category.description || 'No description'}
                          </Typography>
                          {category.monthly_limit && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                                Monthly Limit: ${toNumber(category.monthly_limit, 0).toFixed(2)}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              </>
            )}
          </Box>
        )}
      </Paper>
      
      {/* Budget Modal */}
      <Dialog open={showBudgetModal} onClose={() => setShowBudgetModal(false)}>
        <DialogTitle>Create New Budget</DialogTitle>
        <form onSubmit={handleBudgetSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Budget Name"
              name="name"
              value={newBudget.name}
              onChange={handleBudgetChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Start Date"
              name="start_date"
              type="date"
              value={newBudget.start_date}
              onChange={handleBudgetChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            
            <TextField
              fullWidth
              label="End Date"
              name="end_date"
              type="date"
              value={newBudget.end_date}
              onChange={handleBudgetChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            
            <TextField
              fullWidth
              label="Budget Amount"
              name="total_amount"
              type="number"
              value={newBudget.total_amount}
              onChange={handleBudgetChange}
              margin="normal"
              InputProps={{ 
                startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>
              }}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowBudgetModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Create Budget</Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Category Form */}
      <CategoryForm
        open={showCategoryModal}
        onClose={handleCloseCategoryForm}
        category={currentCategory}
      />
      
      {/* Transaction Modal */}
      <Dialog open={showTransactionModal} onClose={() => setShowTransactionModal(false)}>
        <DialogTitle>Add New Transaction</DialogTitle>
        <form onSubmit={handleTransactionSubmit}>
          <DialogContent>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                name="transaction_type"
                value={newTransaction.transaction_type}
                onChange={handleTransactionTypeChange}
                label="Transaction Type"
              >
                <MenuItem value="expense">Expense</MenuItem>
                <MenuItem value="income">Income</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={newTransaction.amount}
              onChange={handleTransactionChange}
              margin="normal"
              InputProps={{ 
                startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>
              }}
              required
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                name="category_id"
                value={newTransaction.category_id}
                onChange={handleCategorySelectChange}
                label="Category"
              >
                <MenuItem value="">Uncategorized</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newTransaction.description}
              onChange={handleTransactionChange}
              margin="normal"
              multiline
              rows={2}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowTransactionModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Add Transaction</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}