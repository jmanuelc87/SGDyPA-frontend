import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '../../../shared/api/http';

export const meQueryKey = ['identity', 'me'] as const;

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: () => apiFetch('/me', 'get'),
  });
}
