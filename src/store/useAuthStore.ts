import { create } from 'zustand';
import type { RegisterFormData, UserProfile } from '../types/auth';
import {
  clearSession,
  findUserByEmail,
  saveRegisteredUser,
  saveSession,
  getSession,
  updateRegisteredUser,
} from '../utils/storage';

interface AuthState {
  isInitializing: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  initialize: () => Promise<void>;
  register: (data: RegisterFormData) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, 'email'>>) => Promise<{ success: boolean; error?: string }>;
}

function toProfile(user: { fullName: string; email: string; gender: string; mobileNumber: string; address: string; city: string }): UserProfile {
  return {
    fullName: user.fullName,
    email: user.email,
    gender: user.gender as UserProfile['gender'],
    mobileNumber: user.mobileNumber,
    address: user.address,
    city: user.city,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isInitializing: true,
  isAuthenticated: false,
  user: null,

  initialize: async () => {
    try {
      const session = await getSession();
      if (session) {
        const registered = await findUserByEmail(session.email);
        if (registered) {
          set({ isAuthenticated: true, user: toProfile(registered) });
        } else {
          await clearSession();
        }
      }
    } finally {
      set({ isInitializing: false });
    }
  },

  register: async (data) => {
    const existing = await findUserByEmail(data.email);
    if (existing) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    await saveRegisteredUser({
      fullName: data.fullName.trim(),
      email: data.email.trim().toLowerCase(),
      gender: data.gender as NonNullable<RegisterFormData['gender']>,
      mobileNumber: data.mobileNumber.trim(),
      address: data.address.trim(),
      city: data.city,
      password: data.password,
    });
    return { success: true };
  },

  login: async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user || user.password !== password) {
      return { success: false, error: 'Invalid email or password.' };
    }
    await saveSession({ email: user.email, loggedInAt: new Date().toISOString() });
    set({ isAuthenticated: true, user: toProfile(user) });
    return { success: true };
  },

  logout: async () => {
    await clearSession();
    set({ isAuthenticated: false, user: null });
  },

  updateProfile: async (updates) => {
    const currentUser = get().user;
    if (!currentUser) {
      return { success: false, error: 'No active user session.' };
    }
    const updated = await updateRegisteredUser(currentUser.email, updates);
    if (!updated) {
      return { success: false, error: 'Failed to update profile.' };
    }
    set({ user: toProfile(updated) });
    return { success: true };
  },
}));
