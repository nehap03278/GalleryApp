import type {
  LoginFormData,
  LoginFormErrors,
  ProfileFormData,
  ProfileFormErrors,
  RegisterFormData,
  RegisterFormErrors,
} from '../types/auth';

const EMAIL_REGEX = /^[^\s@]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;
const MOBILE_REGEX = /^\d{10}$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidMobile(mobile: string): boolean {
  return MOBILE_REGEX.test(mobile.trim());
}

export function validateRegisterForm(data: RegisterFormData): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!data.gender) {
    errors.gender = 'Please select a gender.';
  }

  if (!data.mobileNumber.trim()) {
    errors.mobileNumber = 'Mobile number is required.';
  } else if (!/^\d+$/.test(data.mobileNumber.trim())) {
    errors.mobileNumber = 'Mobile number must contain digits only.';
  } else if (!isValidMobile(data.mobileNumber)) {
    errors.mobileNumber = 'Mobile number must be exactly 10 digits.';
  }

  if (!data.address.trim()) {
    errors.address = 'Address is required.';
  }

  if (!data.city) {
    errors.city = 'Please select a city.';
  }

  if (!data.password) {
    errors.password = 'Password is required.';
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export function validateLoginForm(data: LoginFormData): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!data.password) {
    errors.password = 'Password is required.';
  }

  return errors;
}

export function validateProfileForm(data: ProfileFormData): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!data.mobileNumber.trim()) {
    errors.mobileNumber = 'Mobile number is required.';
  } else if (!/^\d+$/.test(data.mobileNumber.trim())) {
    errors.mobileNumber = 'Mobile number must contain digits only.';
  } else if (!isValidMobile(data.mobileNumber)) {
    errors.mobileNumber = 'Mobile number must be exactly 10 digits.';
  }

  if (!data.address.trim()) {
    errors.address = 'Address is required.';
  }

  if (!data.city) {
    errors.city = 'Please select a city.';
  }

  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some((v) => Boolean(v));
}
