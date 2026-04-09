import { useAuth, useSessionList, useUser } from "@clerk/expo";
import React from "react";

const AuthDebugger = ({ label }: { label: string }) => {
  const { isLoaded, isSignedIn, sessionId, userId } = useAuth();
  const { user } = useUser();
  const { isLoaded: sessionsLoaded, sessions } = useSessionList();

  React.useEffect(() => {
    console.log(`[auth-debug:${label}] auth`, {
      isLoaded,
      isSignedIn,
      sessionId,
      userId,
    });
  }, [isLoaded, isSignedIn, label, sessionId, userId]);

  React.useEffect(() => {
    console.log(`[auth-debug:${label}] user`, {
      hasUser: !!user,
      primaryEmail: user?.primaryEmailAddress?.emailAddress ?? null,
    });
  }, [label, user]);

  React.useEffect(() => {
    console.log(`[auth-debug:${label}] sessions`, {
      sessionsLoaded,
      total: sessions?.length ?? 0,
      sessionIds: (sessions ?? []).map((session) => session.id),
    });
  }, [label, sessions, sessionsLoaded]);

  return null;
};

export default AuthDebugger;
