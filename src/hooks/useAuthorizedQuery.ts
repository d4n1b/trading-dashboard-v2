import { useSession } from "next-auth/react";
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";

export function useAuthorizedQuery<TData = unknown, TError = unknown>(
  queryKey: QueryKey,
  queryFn: (ctx: { token: string; userId: string | number }) => Promise<TData>,
  options?: Omit<
    UseQueryOptions<TData, TError, TData, QueryKey>,
    "queryKey" | "queryFn"
  >
) {
  const { data: session } = useSession();
  const token = session?.token;
  const userId = session?.user?.id;

  return useQuery<TData, TError>({
    queryKey,
    queryFn: () => {
      if (!token || !userId) throw new Error("No auth");
      return queryFn({ token, userId });
    },
    enabled: (!!token && !!userId) || !!options?.enabled,
    ...options,
  });
}
