import { queryOptions, useQuery } from "@tanstack/react-query";
import { getUser } from "~/handlers/user.handler";

export const userQueryOptions = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: () => getUser(),
  });

export function useUser() {
  return useQuery(userQueryOptions());
}
