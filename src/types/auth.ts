export type Gender = 'Male' | 'Female' | 'Other';

export interface RegisteredUser {
  fullName: string;
  email: string;
  gender: Gender;
  mobileNumber: string;
  address: string;
  city: string;
  password: string;
}

export type UserProfile = Omit<RegisteredUser, 'password'>;

export interface AuthSession {
  email: string;
  loggedInAt: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  gender: Gender | null;
  mobileNumber: string;
  address: string;
  city: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export type RegisterFormErrors = Partial<Record<keyof RegisterFormData, string>>;
export type LoginFormErrors = Partial<Record<keyof LoginFormData, string>>;

export interface ProfileFormData {
  fullName: string;
  mobileNumber: string;
  gender: Gender;
  address: string;
  city: string;
}

export type ProfileFormErrors = Partial<Record<keyof ProfileFormData, string>>;
