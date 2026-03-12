//client.ts
import { getAccessToken, getRefreshToken, setAccessToken } from "../auth/tokenStore";

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL!;
const REFRESH_PATH = "/api/auth/token/refresh/";

type Json = Record<string, unknown> | unknown[] | null;

export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNAUTHENTICATED"
  | "BAD_REQUEST"
  | "UNKNOWN_ERROR";

async function safeFetch(input: RequestInfo, init?: RequestInit, timeoutMs = 12000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error("NETWORK_ERROR"); // treat timeout as network
    throw new Error("NETWORK_ERROR");
  } finally {
    clearTimeout(t);
  }
}

function buildUrl(path: string) {
  return new URL(path, BASE).toString();
}

async function readBodyText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

async function parseJson<T>(text: string, url: string): Promise<T> {
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Failed to parse JSON from ${url}\n${text.slice(0, 300)}`);
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;

  const url = buildUrl(REFRESH_PATH);
  const res = await safeFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refresh }),
  });

  const text = await readBodyText(res);
  if (!res.ok) return null;

  const data = await parseJson<{ access: string }>(text, url);
  if (!data?.access) return null;

  await setAccessToken(data.access);
  return data.access;
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: Json,
  retry = true
): Promise<T> {
  const url = buildUrl(path);
  const token = await getAccessToken();

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  console.log(method, url);

  const res = await safeFetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // If access token expired, refresh once and retry
  if (res.status === 401 && retry) {
    const newAccess = await refreshAccessToken();
    if (newAccess) return request<T>(method, path, body, false);
  }

  const text = await readBodyText(res);

  if (!res.ok) {
    // keep these codes simple for UI
    if (res.status === 401) throw new Error("UNAUTHENTICATED");
    if (res.status === 400) throw new Error(text || "BAD_REQUEST");
    if (res.status >= 500) throw new Error("SERVER_ERROR");
    throw new Error(text || "UNKNOWN_ERROR");
  }

  if (!text) return null as unknown as T;
  return parseJson<T>(text, url);
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export async function apiPostJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  return request<T>("POST", path, body);
}

export async function apiPatchJson<T>(path: string, body: any): Promise<T> {
  return request<T>("PATCH", path, body);
}
