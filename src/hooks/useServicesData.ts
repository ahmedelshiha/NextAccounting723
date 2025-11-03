'use client'

import { useState, useEffect, useCallback } from 'react';
import { Service, ServiceFilters, ServiceStats } from '@/types/services';
import { apiFetch } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

interface UseServicesDataOptions {
  initialFilters?: Partial<ServiceFilters>;
  autoRefresh?: number;
}

export type AuthError = {
  type: 'unauthorized' | 'forbidden';
  statusCode: 401 | 403;
};

export function useServicesData(options: UseServicesDataOptions = {}) {
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const [filters, setFilters] = useState<ServiceFilters>({
    search: '',
    category: 'all',
    featured: 'all',
    status: 'all',
    ...options.initialFilters,
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthError(null);
      const qp = new URLSearchParams();
      if (debouncedSearch) qp.set('search', debouncedSearch);
      if (filters.category && filters.category !== 'all') qp.set('category', String(filters.category));
      if (filters.featured && filters.featured !== 'all') qp.set('featured', String(filters.featured));
      if (filters.status && filters.status !== 'all') qp.set('status', String(filters.status));
      const res = await apiFetch(`/api/admin/services?${qp.toString()}`);

      if (res.status === 401) {
        setAuthError({ type: 'unauthorized', statusCode: 401 });
        return;
      }
      if (res.status === 403) {
        setAuthError({ type: 'forbidden', statusCode: 403 });
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to load services (${res.status})`);
      }
      const data = await res.json();
      setServices(Array.isArray(data.services) ? data.services : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.category, filters.featured, filters.status]);

  const loadStats = useCallback(async () => {
    try {
      setAuthError(null);
      const res = await apiFetch('/api/admin/services/stats');

      if (res.status === 401 || res.status === 403) {
        setAuthError({
          type: res.status === 401 ? 'unauthorized' : 'forbidden',
          statusCode: res.status
        });
        return;
      }

      if (res.ok) {
        setStats(await res.json());
      }
    } catch (e) {
      // Silently fail on stats to not interrupt other data
      console.debug('Stats fetch error:', e);
    }
  }, []);

  useEffect(() => { loadServices(); }, [loadServices]);
  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    if (options.autoRefresh && options.autoRefresh > 0) {
      const t = setInterval(() => { loadServices(); loadStats(); }, options.autoRefresh);
      return () => clearInterval(t);
    }
  }, [options.autoRefresh, loadServices, loadStats]);

  const refresh = useCallback(() => { loadServices(); loadStats(); }, [loadServices, loadStats]);

  return { services, stats, loading, error, authError, filters, setFilters, refresh };
}
