import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({ id: 1, email: 'test@system.io' })),
}));

const TestComponent = () => {
  const { user, login, logout, loading } = useAuth();
  
  if (loading) return <div>Loading Auth...</div>;
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <button onClick={() => login('test@system.io', 'pass')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides null user initially when no token', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });

  it('updates user on successful login', async () => {
    api.post.mockResolvedValueOnce({ data: { token: 'fake-jwt-token' } });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    await act(async () => {
      screen.getByText('Login').click();
    });
    
    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@system.io', password: 'pass' });
    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    expect(screen.getByTestId('user')).toHaveTextContent('test@system.io');
  });

  it('clears user on logout', async () => {
    localStorage.setItem('token', 'fake-jwt-token');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user')).toHaveTextContent('test@system.io');
    
    act(() => {
      screen.getByText('Logout').click();
    });
    
    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByTestId('user')).toHaveTextContent('No User');
  });
});
