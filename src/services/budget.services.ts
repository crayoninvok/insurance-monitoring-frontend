import { apiFetch, getAuthToken } from './api';
import type {
  ListAdminOptionTrendsResponse,
  AdminResetUserTransactionsRequest,
  AdminResetUserTransactionsResponse,
  AdminSpendForUserRequest,
  AdminSpendForUserResponse,
  CreateRawatInapEpisodeOptionRequest,
  CreateRawatInapEpisodeOptionResponse,
  CreateRawatInapEpisodeRequest,
  CreateRawatInapEpisodeResponse,
  CreateRawatJalanMedicalRequest,
  CreateRawatJalanMedicalResponse,
  ListAdminUserLedgerResponse,
  ListAdminUserBudgetsResponse,
  GetMyBudgetResponse,
  ListBudgetPoliciesResponse,
  ListMelahirkanPoliciesResponse,
  ListRawatInapEpisodeOptionsResponse,
  ListRawatInapEpisodesResponse,
  ListRawatInapPoliciesResponse,
  ListRawatJalanMedicalsResponse,
  ListRawatJalanPoliciesResponse,
  SetRawatInapEpisodeOptionActiveRequest,
  SetRawatInapEpisodeOptionActiveResponse,
  SetRawatJalanMedicalActiveRequest,
  SetRawatJalanMedicalActiveResponse,
  UpsertBudgetPolicyRequest,
  UpsertBudgetPolicyResponse,
  UpsertMelahirkanPolicyRequest,
  UpsertMelahirkanPolicyResponse,
  UpsertRawatInapPolicyRequest,
  UpsertRawatInapPolicyResponse,
  UpsertRawatJalanPolicyRequest,
  UpsertRawatJalanPolicyResponse,
  UploadSpendDocumentResponse,
} from '../types/types';

export async function listBudgetPolicies(year?: number) {
  const qs = year ? `?year=${encodeURIComponent(String(year))}` : '';
  return await apiFetch<ListBudgetPoliciesResponse>(`/budget/policies${qs}`, {
    method: 'GET',
  });
}

export async function upsertBudgetPolicy(input: UpsertBudgetPolicyRequest) {
  return await apiFetch<UpsertBudgetPolicyResponse>('/budget/policies', {
    method: 'POST',
    body: input as any,
  });
}

export async function listRawatJalanPolicies(year?: number) {
  const qs = year ? `?year=${encodeURIComponent(String(year))}` : '';
  return await apiFetch<ListRawatJalanPoliciesResponse>(`/budget/policies/rawat-jalan${qs}`, {
    method: 'GET',
  });
}

export async function upsertRawatJalanPolicy(input: UpsertRawatJalanPolicyRequest) {
  return await apiFetch<UpsertRawatJalanPolicyResponse>('/budget/policies/rawat-jalan', {
    method: 'POST',
    body: input as any,
  });
}

export async function listMelahirkanPolicies(year?: number) {
  const qs = year ? `?year=${encodeURIComponent(String(year))}` : '';
  return await apiFetch<ListMelahirkanPoliciesResponse>(`/budget/policies/melahirkan${qs}`, {
    method: 'GET',
  });
}

export async function upsertMelahirkanPolicy(input: UpsertMelahirkanPolicyRequest) {
  return await apiFetch<UpsertMelahirkanPolicyResponse>('/budget/policies/melahirkan', {
    method: 'POST',
    body: input as any,
  });
}

export async function listRawatInapPolicies(year?: number) {
  const qs = year ? `?year=${encodeURIComponent(String(year))}` : '';
  return await apiFetch<ListRawatInapPoliciesResponse>(`/budget/policies/rawat-inap${qs}`, {
    method: 'GET',
  });
}

export async function upsertRawatInapPolicy(input: UpsertRawatInapPolicyRequest) {
  return await apiFetch<UpsertRawatInapPolicyResponse>('/budget/policies/rawat-inap', {
    method: 'POST',
    body: input as any,
  });
}

export async function getMyBudget(year?: number) {
  const qs = year ? `?year=${encodeURIComponent(String(year))}` : '';
  return await apiFetch<GetMyBudgetResponse>(`/budget/me${qs}`, {
    method: 'GET',
  });
}

export async function listRawatJalanMedicals(activeOnly = true) {
  const qs = `?active=${encodeURIComponent(activeOnly ? 'true' : 'false')}`;
  return await apiFetch<ListRawatJalanMedicalsResponse>(`/budget/lookups/rawat-jalan-medicals${qs}`, {
    method: 'GET',
  });
}

export async function createRawatJalanMedical(input: CreateRawatJalanMedicalRequest) {
  return await apiFetch<CreateRawatJalanMedicalResponse>(`/budget/lookups/rawat-jalan-medicals`, {
    method: 'POST',
    body: input as any,
  });
}

export async function setRawatJalanMedicalActive(id: string, input: SetRawatJalanMedicalActiveRequest) {
  return await apiFetch<SetRawatJalanMedicalActiveResponse>(`/budget/lookups/rawat-jalan-medicals/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: input as any,
  });
}

export async function listRawatInapEpisodeOptions(activeOnly = true) {
  const qs = `?active=${encodeURIComponent(activeOnly ? 'true' : 'false')}`;
  return await apiFetch<ListRawatInapEpisodeOptionsResponse>(`/budget/lookups/rawat-inap-episode-options${qs}`, {
    method: 'GET',
  });
}

export async function createRawatInapEpisodeOption(input: CreateRawatInapEpisodeOptionRequest) {
  return await apiFetch<CreateRawatInapEpisodeOptionResponse>(`/budget/lookups/rawat-inap-episode-options`, {
    method: 'POST',
    body: input as any,
  });
}

export async function setRawatInapEpisodeOptionActive(id: string, input: SetRawatInapEpisodeOptionActiveRequest) {
  return await apiFetch<SetRawatInapEpisodeOptionActiveResponse>(
    `/budget/lookups/rawat-inap-episode-options/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: input as any,
    },
  );
}

// ADMIN
export async function listAdminUserBudgets(year?: number) {
  const qs = year ? `?year=${encodeURIComponent(String(year))}` : '';
  return await apiFetch<ListAdminUserBudgetsResponse>(`/budget/admin/balances${qs}`, {
    method: 'GET',
  });
}

export async function listRawatInapEpisodes(userId: string, year?: number) {
  const params = new URLSearchParams();
  params.set('userId', userId);
  if (year) params.set('year', String(year));
  return await apiFetch<ListRawatInapEpisodesResponse>(`/budget/admin/rawat-inap/episodes?${params.toString()}`, {
    method: 'GET',
  });
}

export async function createRawatInapEpisode(input: CreateRawatInapEpisodeRequest) {
  return await apiFetch<CreateRawatInapEpisodeResponse>(`/budget/admin/rawat-inap/episodes`, {
    method: 'POST',
    body: input as any,
  });
}

export async function listAdminUserLedger(userId: string, year?: number) {
  const params = new URLSearchParams();
  params.set('userId', userId);
  if (year) params.set('year', String(year));

  return await apiFetch<ListAdminUserLedgerResponse>(`/budget/admin/ledger?${params.toString()}`, {
    method: 'GET',
  });
}

export async function adminSpendForUser(input: AdminSpendForUserRequest) {
  return await apiFetch<AdminSpendForUserResponse>(`/budget/admin/spend`, {
    method: 'POST',
    body: input as any,
  });
}

export async function uploadSpendDocument(file: File) {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  if (!base) throw new Error('NEXT_PUBLIC_API_URL belum diset di frontend/.env');
  const token = getAuthToken();
  if (!token) throw new Error('Unauthorized');
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${base}/budget/admin/spend-document`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
  const parsed = await res.json().catch(() => undefined);
  if (!res.ok) {
    const message =
      parsed && typeof parsed === 'object' && 'message' in parsed
        ? String((parsed as any).message)
        : `HTTP ${res.status}`;
    throw new Error(message);
  }
  return parsed as UploadSpendDocumentResponse;
}

export async function adminResetUserTransactions(input: AdminResetUserTransactionsRequest) {
  return await apiFetch<AdminResetUserTransactionsResponse>(`/budget/admin/reset-user-transactions`, {
    method: 'POST',
    body: input as any,
  });
}

export async function listAdminOptionTrends(year?: number) {
  const qs = year ? `?year=${encodeURIComponent(String(year))}` : '';
  return await apiFetch<ListAdminOptionTrendsResponse>(`/budget/admin/trends/options${qs}`, {
    method: 'GET',
  });
}

