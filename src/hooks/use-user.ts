import { useAuth } from "@clerk/tanstack-react-start";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getUser } from "~/handlers/user.handler";

export const userQueryOptions = (clerkId: string) =>
  queryOptions({
    queryKey: ["user", { clerkId }],
    enabled: !!clerkId,
    queryFn: () =>
      getUser({
        data: clerkId,
      }),
  });

export function useUser() {
  const { userId: clerkId } = useAuth();
  return useQuery(userQueryOptions(clerkId!));
}
