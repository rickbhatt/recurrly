import AuthDebugger from "@/components/auth/auth-debugger";
import { ClerkLoaded, ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PostHogProvider } from "posthog-react-native";
import "../global.css";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Add your Clerk publishable key to the .env file.");
}

const Layout = () => (
  <>
    <StatusBar style="dark" />
    <AuthDebugger label="root-layout" />
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="subscriptions/[id]" />
    </Stack>
  </>
);

export default function RootLayout() {
  return (
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY as string}
      options={{ host: process.env.EXPO_PUBLIC_POSTHOG_HOST }}
    >
      <ClerkProvider
        standardBrowser={false}
        publishableKey={publishableKey as string}
        tokenCache={tokenCache}
      >
        <ClerkLoaded>
          <Layout />
        </ClerkLoaded>
      </ClerkProvider>
    </PostHogProvider>
  );
}
