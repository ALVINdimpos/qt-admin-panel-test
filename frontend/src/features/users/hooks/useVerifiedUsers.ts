import { useQuery } from "@tanstack/react-query";
import { fetchVerifiedUsers } from "@/services/users";

export function useVerifiedUsers() {
  return useQuery({
    queryKey: ["users", "verified"],
    queryFn: fetchVerifiedUsers,
    staleTime: 10_000,
  });
}
