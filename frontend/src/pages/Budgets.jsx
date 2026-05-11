import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Trash2 } from 'lucide-react';

const Budgets = () => {
  const queryClient = useQueryClient();
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState('expense');
  
  const [budgetCat, setBudgetCat] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');

  const { data: categories, isLoading: loadingCat } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data,
  });

  const { data: budgets, isLoading: loadingBudgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => (await api.get('/budgets')).data,
  });

  const addCategory = useMutation({
    mutationFn: (newCat) => api.post('/categories', newCat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCatName('');
    }
  });

  const deleteCategory = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] })
  });

  const setBudget = useMutation({
    mutationFn: (data) => api.post('/budgets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setBudgetCat('');
      setBudgetLimit('');
    }
  });

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (catName) addCategory.mutate({ name: catName, type: catType });
  };

  const handleSetBudget = (e) => {
    e.preventDefault();
    const d = new Date();
    if (budgetCat && budgetLimit) {
      setBudget.mutate({
        category: budgetCat,
        amount_limit: budgetLimit,
        month: d.getMonth() + 1,
        year: d.getFullYear()
      });
    }
  };

  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">System Configuration</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Categories Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Categories</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Add Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCategory} className="flex gap-2 items-end">
                <div className="space-y-2 flex-1">
                  <Label>Name</Label>
                  <Input value={catName} onChange={e => setCatName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select 
                    value={catType}
                    onChange={e => setCatType(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="expense" className="bg-background">Expense</option>
                    <option value="income" className="bg-background">Income</option>
                  </select>
                </div>
                <Button type="submit" disabled={addCategory.isPending}>Add</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {loadingCat ? <div className="text-sm text-muted-foreground">Loading...</div> : categories?.map(c => (
              <div key={c.id} className="flex justify-between items-center p-3 border border-border rounded-md bg-card">
                <div>
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-2 text-xs uppercase text-muted-foreground">{c.type}</span>
                </div>
                <button onClick={() => deleteCategory.mutate(c.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Budgets Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Budgets</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Set Monthly Limit</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSetBudget} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <select 
                    value={budgetCat}
                    onChange={e => setBudgetCat(e.target.value)}
                    required
                    className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="" disabled className="bg-background">Select Expense Category</option>
                    {expenseCategories.map(c => (
                      <option key={c.id} value={c.name} className="bg-background">{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Limit Amount</Label>
                  <Input type="number" step="0.01" value={budgetLimit} onChange={e => setBudgetLimit(e.target.value)} required />
                </div>
                <Button type="submit" disabled={setBudget.isPending}>Set budget</Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-2">
             {loadingBudgets ? <div className="text-sm text-muted-foreground">Loading...</div> : budgets?.map(b => (
              <div key={b.id} className="flex justify-between items-center p-3 border border-border rounded-md bg-card">
                <div>
                  <span className="font-medium">{b.category}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{b.month}/{b.year}</span>
                </div>
                <div className="font-mono font-bold text-primary">
                  ${parseFloat(b.amount_limit).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budgets;
