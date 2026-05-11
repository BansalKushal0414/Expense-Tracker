import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '../pages/Dashboard';
import api from '../services/api';

// Mock the API client
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Turn off retries for faster tests
    },
  },
});

const renderWithClient = (ui) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('Dashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('renders loading state initially', () => {
    api.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderWithClient(<Dashboard />);
    expect(screen.getByText(/loading data.../i)).toBeInTheDocument();
  });

  it('renders summary data successfully', async () => {
    const mockData = {
      totals: { income: 5000, expense: 2000, net_savings: 3000 },
      summary: [
        { category: 'Salary', type: 'income', total_amount: '5000', transaction_count: 1 },
        { category: 'Rent', type: 'expense', total_amount: '2000', transaction_count: 1 }
      ]
    };
    
    api.get.mockResolvedValueOnce({ data: mockData });
    
    renderWithClient(<Dashboard />);
    
    expect(await screen.findByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('$5000.00')).toBeInTheDocument();
    expect(screen.getByText('$2000.00')).toBeInTheDocument();
    expect(screen.getByText('$3000.00')).toBeInTheDocument();
    
    // Check categories
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });

  it('renders error state if API fails', async () => {
    api.get.mockRejectedValueOnce(new Error('API failed'));
    
    renderWithClient(<Dashboard />);
    
    expect(await screen.findByText(/failed to load data/i)).toBeInTheDocument();
  });
});
