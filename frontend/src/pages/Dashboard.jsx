import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from 'lucide-react';

const fetchSummary = async () => {
  const { data } = await api.get('/transactions/reports/summary?days=30');
  return data;
};

const Dashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['summary'],
    queryFn: fetchSummary,
  });

  if (isLoading) return <div className="p-6 text-muted-foreground text-sm">Loading data...</div>;
  if (error) return <div className="p-6 text-destructive text-sm">Failed to load data.</div>;

  const { totals, summary } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-primary">${totals.income.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Past 30 days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">${totals.expense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Past 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${totals.net_savings >= 0 ? 'text-foreground' : 'text-destructive'}`}>
              ${totals.net_savings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Past 30 days</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold tracking-tight mt-8 mb-4">Category Breakdown</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summary.map((item, index) => (
          <Card key={index} className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex justify-between uppercase">
                <span>{item.category}</span>
                <span className={item.type === 'income' ? 'text-primary' : 'text-foreground'}>
                  {item.type}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold font-mono">${parseFloat(item.total_amount).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{item.transaction_count} transactions</p>
            </CardContent>
          </Card>
        ))}
        {summary.length === 0 && (
          <div className="text-muted-foreground col-span-full">No data available for the selected period.</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
