import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// ── Local storage data layer ──────────────────────────────────────────────
const STORAGE_PREFIX = 'soma_db_';
const AUTH_KEY = 'soma_auth_user';

function getTable<T = any>(name: string): T[] {
  const raw = localStorage.getItem(STORAGE_PREFIX + name);
  if (!raw) {
    localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveTable<T = any>(name: string, rows: T[]) {
  localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(rows));
}

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Chainable query builder ───────────────────────────────────────────────
interface QueryState {
  table: string;
  filters: { column: string; value: any }[];
  orderCol?: string;
  orderAsc?: boolean;
  limitN?: number;
}

class QueryBuilder {
  private state: QueryState;

  constructor(table: string) {
    this.state = { table, filters: [] };
  }

  select(_columns: string = '*') {
    return this;
  }

  eq(column: string, value: any) {
    this.state.filters.push({ column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.state.orderCol = column;
    this.state.orderAsc = options?.ascending ?? true;
    return this;
  }

  limit(n: number) {
    this.state.limitN = n;
    return this;
  }

  private applyFilters(rows: any[]): any[] {
    let result = rows;
    for (const f of this.state.filters) {
      result = result.filter(r => r[f.column] === f.value);
    }
    if (this.state.orderCol) {
      result = [...result].sort((a, b) => {
        const av = a[this.state.orderCol!];
        const bv = b[this.state.orderCol!];
        if (av < bv) return this.state.orderAsc ? -1 : 1;
        if (av > bv) return this.state.orderAsc ? 1 : -1;
        return 0;
      });
    }
    if (this.state.limitN !== undefined) {
      result = result.slice(0, this.state.limitN);
    }
    return result;
  }

  then(resolve: (value: any) => void, reject?: (reason: any) => void) {
    try {
      const rows = getTable(this.state.table);
      const filtered = this.applyFilters(rows);
      resolve({ data: filtered, error: null, count: filtered.length, status: 200, statusText: 'OK' });
    } catch (err) {
      reject(err);
    }
  }

  insert(payload: any | any[]) {
    const rows = getTable(this.state.table);
    const items = Array.isArray(payload) ? payload : [payload];
    const now = new Date().toISOString();
    const userId = getCurrentUser()?.id || 'local-user';
    for (const item of items) {
      rows.push({
        id: uid(),
        user_id: userId,
        created_at: now,
        updated_at: now,
        ...item,
      });
    }
    saveTable(this.state.table, rows);
    return Promise.resolve({ data: null, error: null, status: 201, statusText: 'Created' });
  }

  update(patch: Record<string, any>) {
    const rows = getTable(this.state.table);
    let updated = 0;
    for (let i = 0; i < rows.length; i++) {
      const matches = this.state.filters.every(f => rows[i][f.column] === f.value);
      if (matches) {
        rows[i] = { ...rows[i], ...patch, updated_at: new Date().toISOString() };
        updated++;
      }
    }
    saveTable(this.state.table, rows);
    return Promise.resolve({ data: null, error: null, status: 200, statusText: 'OK' });
  }

  delete() {
    const rows = getTable(this.state.table);
    const kept = rows.filter(r => !this.state.filters.every(f => r[f.column] === f.value));
    saveTable(this.state.table, kept);
    return Promise.resolve({ data: null, error: null, status: 200, statusText: 'OK' });
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────
interface LocalUser {
  id: string;
  email: string;
  user_metadata: { full_name?: string };
  created_at: string;
}

function getCurrentUser(): LocalUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCurrentUser(user: LocalUser | null) {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

const authListeners: ((event: string, session: any) => void)[] = [];

const auth = {
  async getUser() {
    return { data: { user: getCurrentUser() }, error: null };
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const accountsKey = 'soma_accounts';
    const accounts: Record<string, { password: string; user: LocalUser }> = (() => {
      try { return JSON.parse(localStorage.getItem(accountsKey) || '{}'); } catch { return {}; }
    })();

    const account = accounts[email];
    if (!account || account.password !== password) {
      return { data: { user: null, session: null }, error: { message: 'Email ou mot de passe incorrect' } };
    }

    setCurrentUser(account.user);
    authListeners.forEach(fn => fn('SIGNED_IN', { user: account.user }));
    return { data: { user: account.user, session: { user: account.user } }, error: null };
  },

  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: { full_name?: string } } }) {
    const accountsKey = 'soma_accounts';
    const accounts: Record<string, { password: string; user: LocalUser }> = (() => {
      try { return JSON.parse(localStorage.getItem(accountsKey) || '{}'); } catch { return {}; }
    })();

    if (accounts[email]) {
      return { data: { user: null, session: null }, error: { message: 'Un compte existe déjà avec cet email' } };
    }

    const user: LocalUser = {
      id: uid(),
      email,
      user_metadata: { full_name: options?.data?.full_name || '' },
      created_at: new Date().toISOString(),
    };

    accounts[email] = { password, user };
    localStorage.setItem(accountsKey, JSON.stringify(accounts));
    setCurrentUser(user);
    authListeners.forEach(fn => fn('SIGNED_IN', { user }));
    return { data: { user, session: { user } }, error: null };
  },

  async signOut() {
    setCurrentUser(null);
    authListeners.forEach(fn => fn('SIGNED_OUT', null));
    return { error: null };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    authListeners.push(callback);
    const session = getCurrentUser() ? { user: getCurrentUser() } : null;
    callback('INITIAL_SESSION', session);
    return {
      data: {
        subscription: {
          unsubscribe() {
            const idx = authListeners.indexOf(callback);
            if (idx >= 0) authListeners.splice(idx, 1);
          },
        },
      },
    };
  },
};

// ── Mock client ───────────────────────────────────────────────────────────
const mockClient = {
  auth,
  from(table: string) {
    return new QueryBuilder(table);
  },
};

// Use mock if Supabase URL is unreachable, otherwise use real client
export const supabase = mockClient as any;
export const useSupabase = () => ({ supabase });
