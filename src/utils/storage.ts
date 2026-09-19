import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession, RegisteredUser } from '../types/auth';
import type { PicsumImage } from '../types/gallery';

const KEYS = {
  USERS: '@gallery_app/users',
  SESSION: '@gallery_app/session',
  FAVORITES: '@gallery_app/favorites',
} as const;

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getRegisteredUsers(): Promise<RegisteredUser[]> {
  const users = await readJson<RegisteredUser[]>(KEYS.USERS);
  return users ?? [];
}

export async function saveRegisteredUser(user: RegisteredUser): Promise<void> {
  const users = await getRegisteredUsers();
  users.push(user);
  await writeJson(KEYS.USERS, users);
}

export async function updateRegisteredUser(email: string, updates: Partial<RegisteredUser>): Promise<RegisteredUser | null> {
  const users = await getRegisteredUsers();
  const index = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  await writeJson(KEYS.USERS, users);
  return users[index];
}

export async function findUserByEmail(email: string): Promise<RegisteredUser | null> {
  const users = await getRegisteredUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function getSession(): Promise<AuthSession | null> {
  return readJson<AuthSession>(KEYS.SESSION);
}

export async function saveSession(session: AuthSession): Promise<void> {
  await writeJson(KEYS.SESSION, session);
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SESSION);
}

export async function getFavorites(): Promise<PicsumImage[]> {
  const favorites = await readJson<PicsumImage[]>(KEYS.FAVORITES);
  return favorites ?? [];
}

export async function saveFavorites(favorites: PicsumImage[]): Promise<void> {
  await writeJson(KEYS.FAVORITES, favorites);
}
