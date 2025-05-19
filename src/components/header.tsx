import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePrivacyStore } from "@/store";

export function Header() {
  const { data: session } = useSession();

  if (!session) return null;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
    usePrivacyStore.persist.clearStorage();
  };

  return (
    <header className="border-b bg-primary">
      <div className="flex h-12 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="/avatar_04.png"
                    alt={session.user?.username}
                  />
                  <AvatarFallback>
                    {session.user?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium text-muted-foreground">
                    {session.user?.username}
                  </p>
                </div>
              </div>
              <DropdownMenuItem onClick={handleSignOut}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
