'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { AuthContextType } from '@/lib/types/auth';
import { WithChildrenProps } from '@/lib/types';



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: WithChildrenProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
