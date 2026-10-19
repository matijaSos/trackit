import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router";
import { useAuth } from "wasp/client/auth";
import { routes } from "wasp/client/router";

/**
 * Renders `children` only for logged-out users, otherwise redirects
 * to a specified route.
 */
export function RedirectIfLoggedIn({
  children,
  to = routes.TimerRoute.to,
}: {
  children: ReactNode;
  to?: string;
}) {
  const { data: user, isLoading } = useAuth();

  // Auth not resolved yet - withhold rendering so we never flash the form
  // to a user who turns out to be logged in.
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={to} replace />;
  }

  return <>{children}</>;
}
