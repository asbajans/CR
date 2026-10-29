import { create } from 'zustand';
import { User } from '../types';

interface AppState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => set({ user, token }),
  logout: () => {
    localStorage.removeItem('crdent_token');
    localStorage.removeItem('crdent_user');
    set({ user: null, token: null });
  },
}));
