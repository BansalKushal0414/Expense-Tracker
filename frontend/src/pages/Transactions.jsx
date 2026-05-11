import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

const fetchTransactions = async (page = 1) => {
  const { data } = await api.get(`/transactions?page=${page}&limit=10`);
  return data;
};

const fetchCategories = async () => {
  const { data } = await api.get('/categories');
  return data;
};

const Transactions = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: '', category: '', type: 'expense', description: '', date: new Date().toISOString().split('T')[0] });
  const [formError, setFormError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page],
    queryFn: () => fetchTransactions(page),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const mutation = useMutation({
    mutationFn: (newTx) => api.post('/transactions', newTx),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setIsFormOpen(false);
      setFormData({ amount: '', category: '', type: 'expense', description: '', date: new Date().toISOString().split('T')[0] });
      setFormError('');
      if (res.data.alert) {
        alert(res.data.alert); // Quick alert for budget warning
      }
    },
    onError: (err) => {
      setFormError(err.response?.data?.error || 'Failed to add transaction');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const currentCategories = categories?.filter(c => c.type === formData.type) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Ledger</h1>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? 'Close form' : 'New entry'}
        </Button>
      </div>

      {isFormOpen && (
        <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-4">Add Transaction</h2>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value, category: ''})}
                className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="expense" className="bg-background">Expense</option>
                <option value="income" className="bg-background">Income</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                required 
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                required
                className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="" disabled className="bg-background">Select Category</option>
                {currentCategories.map(c => (
                  <option key={c.id} value={c.name} className="bg-background">{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Input 
                type="text" 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
            {formError && <div className="text-destructive text-sm col-span-full bg-destructive/10 p-2 rounded">{formError}</div>}
            <div className="col-span-full">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save entry'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Loading records...</TableCell></TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No records found.</TableCell></TableRow>
            ) : (
              data?.data?.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono">{tx.date}</TableCell>
                  <TableCell className="capitalize text-xs font-medium text-muted-foreground">{tx.type}</TableCell>
                  <TableCell>{tx.category}</TableCell>
                  <TableCell className="text-muted-foreground">{tx.description}</TableCell>
                  <TableCell className={`text-right font-mono font-bold ${tx.type === 'income' ? 'text-primary' : 'text-foreground'}`}>
                    ${parseFloat(tx.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.pages > 1 && (
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {data.pages}</span>
          <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Transactions;
