import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type DebugTokenCache = {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => Promise<void>;
};

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

const maskToken = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  return `${value.slice(0, 12)}...(${value.length})`;
};

export const debugTokenCache: DebugTokenCache | undefined =
  Platform.OS === "ios" || Platform.OS === "android"
    ? {
        getToken: async (key: string) => {
          try {
            const token = await SecureStore.getItemAsync(key, secureStoreOptions);
            console.log("[token-cache-debug] getToken", {
              key,
              hasToken: !!token,
              tokenPreview: maskToken(token),
            });
            return token;
          } catch (error) {
            console.log("[token-cache-debug] getToken:error", {
              key,
              error,
            });
            await SecureStore.deleteItemAsync(key, secureStoreOptions);
            return null;
          }
        },
        saveToken: async (key: string, token: string) => {
          console.log("[token-cache-debug] saveToken", {
            key,
            hasToken: !!token,
            tokenPreview: maskToken(token),
          });
          await SecureStore.setItemAsync(key, token, secureStoreOptions);
        },
        clearToken: async (key: string) => {
          console.log("[token-cache-debug] clearToken", { key });
          await SecureStore.deleteItemAsync(key, secureStoreOptions);
        },
      }
    : undefined;
