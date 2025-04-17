'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Fab,
  Grid,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import BudgetOverview from '@/components/budget/BudgetOverview';
import CategoryForm from '@/components/budget/CategoryForm';
import TransactionForm from '@/components/budget/TransactionForm';
import { useHousehold } from '@/lib/hooks/useHousehold';

export default function BudgetPage() {
  const { household, loading, error: householdError } = useHousehold();
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleCloseCategoryForm = (shouldRefresh) => {
    setCategoryFormOpen(false);
    setCurrentCategory(null);
    
    if (shouldRefresh) {
      setRefreshKey(prev => prev + 1);
    }
  };
  
  const handleCloseTransactionForm = (shouldRefresh) => {
    setTransactionFormOpen(false);
    setCurrentTransaction(null);
    
    if (shouldRefresh) {
      setRefreshKey(prev => prev + 1);
    }
  };
  
  const handleAddCategory = () => {
    setCurrentCategory(null);
    setCategoryFormOpen(true);
  };
  
  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setCategoryFormOpen(true);
  };
  
  const handleAddTransaction = () => {
    setCurrentTransaction(null);
    setTransactionFormOpen(true);
  };
  
  const handleEditTransaction = (transaction) => {
    setCurrentTransaction(transaction);
    setTransactionFormOpen(true);
  };
  
  // Render a message if no household is found
  if (!loading && !household) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          No Household Found
        </Typography>
        <Typography paragraph>
          You need to be part of a household to manage budget. Please complete the onboarding process.
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }} 
          href="/onboarding"
        >
          Go to Onboarding
        </Button>
      </Paper>
    );
  }
  
  return (
    <Grid container spacing={3}>
      {householdError && (
        <Grid item xs={12}>
          <Alert severity="error">
            Error loading household data: {householdError.message}
          </Alert>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Household Budget</Typography>
          
          <BudgetOverview 
            key={refreshKey} // Force refresh when data changes
            onAddCategory={handleAddCategory}
            onAddTransaction={handleAddTransaction}
          />
        </Paper>
      </Grid>
      
      {/* Mobile FAB for adding transactions */}
      <Fab
        color="primary"
        aria-label="add transaction"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={handleAddTransaction}
      >
        <AddIcon />
      </Fab>
      
      {/* Category Form Dialog */}
      <CategoryForm
        open={categoryFormOpen}
        onClose={handleCloseCategoryForm}
        category={currentCategory}
      />
      
      {/* Transaction Form Dialog */}
      <TransactionForm
        open={transactionFormOpen}
        onClose={handleCloseTransactionForm}
        transaction={currentTransaction}
      />
    </Grid>
  );
}
