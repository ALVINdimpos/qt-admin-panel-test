import { http } from "./http";

export type CountPoint = { 
  date: string; 
  count: number; 
};

export async function fetchUsersPerDay(days = 7): Promise<CountPoint[]> {
  const res = await http(`/api/stats/users-per-day?days=${days}`);
  const data = await res.json();
  return data.data || [];
}
