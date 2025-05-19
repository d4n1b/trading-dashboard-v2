import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type SessionProviderProps = React.PropsWithChildren;

export function SessionProvider({ children }: SessionProviderProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return children;
}
