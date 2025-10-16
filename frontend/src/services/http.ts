import { ENV } from "@/config/env";

export const API = ENV.API_URL;

export async function http(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(`${API}${input}`, init);
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res;
}
