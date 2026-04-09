import {
  AuthButton,
  AuthField,
  AuthSecondaryButton,
} from "@/components/auth/auth-primitives";
import AuthShell from "@/components/auth/auth-shell";
import {
  normalizeClerkError,
  validateSignIn,
  validateVerificationCode,
  type AuthFormErrors,
} from "@/lib/auth";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

const emptyErrors: AuthFormErrors = { fields: {} };

const SignIn = () => {
  const { signIn } = useSignIn();
  const router = useRouter();
  const posthog = usePostHog();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<AuthFormErrors>(emptyErrors);

  const needsEmailCode = signIn?.status === "needs_client_trust";

  const resetErrors = () => setFormErrors(emptyErrors);

  const finalizeSignIn = async (activeSignIn: NonNullable<typeof signIn>) => {
    const { error } = await activeSignIn.finalize({
      navigate: async ({
        session,
      }: {
        session?: { currentTask?: unknown };
      }) => {
        if (session?.currentTask) {
          setFormErrors({
            form: "We need one more verification step before opening your workspace.",
            fields: {},
          });
          return;
        }

        posthog.identify(emailAddress, {
          $set: { email: emailAddress },
          $set_once: { first_sign_inn_date: new Date().toISOString() },
        });
        posthog.capture("user_signed_in", { email: emailAddress });

        router.replace("/(tabs)");
      },
    });

    if (error) {
      setFormErrors(
        normalizeClerkError(error, "We couldn't finish signing you in."),
      );
    }
  };

  const handleSubmit = async () => {
    if (!signIn) {
      return;
    }

    const nextErrors = validateSignIn({ emailAddress, password });
    if (Object.keys(nextErrors.fields).length) {
      setFormErrors(nextErrors);
      return;
    }

    resetErrors();
    setIsSubmitting(true);

    try {
      const { error } = await signIn.password({
        emailAddress: emailAddress.trim(),
        password,
      });

      if (error) {
        setFormErrors(
          normalizeClerkError(
            error,
            "Your email or password didn't match our records.",
          ),
        );
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn(signIn);
        return;
      }

      if (signIn.status === "needs_client_trust") {
        const { error: emailCodeError } = await signIn.mfa.sendEmailCode();
        if (emailCodeError) {
          setFormErrors(
            normalizeClerkError(
              emailCodeError,
              "We couldn't send the verification code just now.",
            ),
          );
        }
        return;
      }

      setFormErrors({
        form: "This sign-in attempt needs another step. Please try again.",
        fields: {},
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signIn) {
      return;
    }

    const nextErrors = validateVerificationCode(code);
    if (Object.keys(nextErrors.fields).length) {
      setFormErrors(nextErrors);
      return;
    }

    resetErrors();
    setIsVerifying(true);

    try {
      const { error } = await signIn.mfa.verifyEmailCode({
        code: code.trim(),
      });

      if (error) {
        setFormErrors(
          normalizeClerkError(
            error,
            "That code didn't go through. Double-check it and try again.",
          ),
        );
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn(signIn);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!signIn) {
      return;
    }

    resetErrors();
    setIsResending(true);

    try {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) {
        setFormErrors(
          normalizeClerkError(error, "We couldn't resend the code right now."),
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleStartOver = async () => {
    if (!signIn) {
      return;
    }

    await signIn.reset();
    setCode("");
    setPassword("");
    resetErrors();
  };

  if (!signIn) {
    return null;
  }

  if (needsEmailCode) {
    return (
      <AuthShell
        title="Secure your sign in"
        subtitle="Enter the 6-digit code we sent to your email to finish opening your billing workspace."
      >
        <View className="auth-form">
          <AuthField
            label="Verification code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={6}
            error={formErrors.fields.code}
            helper="Codes usually arrive within a few seconds."
            placeholder="Enter the 6-digit code"
          />

          {formErrors.form ? (
            <Text className="auth-error">{formErrors.form}</Text>
          ) : null}

          <AuthButton
            title="Verify and continue"
            onPress={handleVerify}
            loading={isVerifying}
            disabled={!code.trim()}
          />

          <AuthSecondaryButton
            title={isResending ? "Sending code..." : "Resend code"}
            onPress={handleResendCode}
            disabled={isResending}
          />

          <AuthSecondaryButton title="Start over" onPress={handleStartOver} />
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep your renewals, spend, and billing decisions in one place."
    >
      <View className="auth-form">
        <AuthField
          label="Email"
          value={emailAddress}
          onChangeText={setEmailAddress}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          error={formErrors.fields.emailAddress}
          placeholder="Enter your email"
        />

        <AuthField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          textContentType="password"
          error={formErrors.fields.password}
          placeholder="Enter your password"
          rightSlot={
            <Pressable onPress={() => setShowPassword((value) => !value)}>
              <Text className="text-xs font-sans-bold text-accent">
                {showPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          }
        />

        {formErrors.form ? (
          <Text className="auth-error">{formErrors.form}</Text>
        ) : null}

        <AuthButton
          title="Sign in"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!emailAddress.trim() || !password}
        />

        <View className="auth-divider-row">
          <View className="auth-divider-line" />
          <Text className="auth-divider-text">Protected access</Text>
          <View className="auth-divider-line" />
        </View>

        <Text className="auth-helper text-center">
          Your account data stays secured with encrypted session storage on this
          device.
        </Text>

        <View className="auth-link-row">
          <Text className="auth-link-copy">New to Recurrly?</Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable>
              <Text className="auth-link">Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </AuthShell>
  );
};

export default SignIn;
