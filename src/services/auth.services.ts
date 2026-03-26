import { apiFetch, setAuthToken } from './api';
import type {
  AdminListUsersResponse,
  AdminUpdateUserRequest,
  AdminUpdateUserResponse,
  CreateUserRequest,
  CreateUserResponse,
  GetMeResponse,
  LoginRequest,
  LoginResponse,
  UpdateMyProfileRequest,
  UpdateMyProfileResponse,
} from '../types/types';

export async function login(input: LoginRequest) {
  const res = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: input,
  });

  if (!res.success) return res;
  setAuthToken(res.token);
  return res;
}

export function logout() {
  setAuthToken(null);
}

// ADMIN only (but enforcement happens on backend via JWT role)
export async function createUser(input: CreateUserRequest) {
  return await apiFetch<CreateUserResponse>('/auth/users', {
    method: 'POST',
    body: input,
  });
}

export async function getMe() {
  return await apiFetch<GetMeResponse>('/auth/me', {
    method: 'GET',
  });
}

export async function updateMyProfile(input: UpdateMyProfileRequest) {
  return await apiFetch<UpdateMyProfileResponse>('/auth/me', {
    method: 'PATCH',
    body: input as any,
  });
}

export async function adminListUsers(params?: { q?: string; page?: number; pageSize?: number }) {
  const search = new URLSearchParams();
  if (params?.q) search.set('q', params.q);
  if (params?.page) search.set('page', String(params.page));
  if (params?.pageSize) search.set('pageSize', String(params.pageSize));
  const qs = search.toString();
  return await apiFetch<AdminListUsersResponse>(`/auth/users${qs ? `?${qs}` : ''}`, {
    method: 'GET',
  });
}

export async function adminUpdateUser(userId: string, input: AdminUpdateUserRequest) {
  return await apiFetch<AdminUpdateUserResponse>(`/auth/users/${userId}`, {
    method: 'PATCH',
    body: input as any,
  });
}

export async function adminDeleteUser(userId: string) {
  return await apiFetch<{ success: boolean; message: string }>(`/auth/users/${userId}`, {
    method: 'DELETE',
  });
}

