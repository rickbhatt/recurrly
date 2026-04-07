import AuthShell from "@/components/auth/auth-shell";
import {
  AuthButton,
  AuthField,
  AuthSecondaryButton,
} from "@/components/auth/auth-primitives";
import {
  normalizeClerkError,
  validateSignUp,
  validateVerificationCode,
  type AuthFormErrors,
} from "@/lib/auth";
import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

const emptyErrors: AuthFormErrors = { fields: {} };

const SignUp = () => {
  const { signUp } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<AuthFormErrors>(emptyErrors);

  const isAwaitingVerification =
    signUp?.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const resetErrors = () => setFormErrors(emptyErrors);

  const finalizeSignUp = async (activeSignUp: NonNullable<typeof signUp>) => {
    const { error } = await activeSignUp.finalize({
      navigate: ({ session }: { session?: { currentTask?: unknown } }) => {
        if (session?.currentTask) {
          setFormErrors({
            form: "We need one more verification step before opening your workspace.",
            fields: {},
          });
          return;
        }

        router.replace("/(tabs)");
      },
    });

    if (error) {
      setFormErrors(
        normalizeClerkError(error, "We couldn't finish setting up your account."),
      );
    }
  };

  const handleSubmit = async () => {
    if (!signUp) {
      return;
    }

    const nextErrors = validateSignUp({
      emailAddress,
      password,
      confirmPassword,
    });

    if (Object.keys(nextErrors.fields).length) {
      setFormErrors(nextErrors);
      return;
    }

    resetErrors();
    setIsSubmitting(true);

    try {
      const { error } = await signUp.password({
        emailAddress: emailAddress.trim(),
        password,
      });

      if (error) {
        setFormErrors(
          normalizeClerkError(
            error,
            "We couldn't create your account with those details.",
          ),
        );
        return;
      }

      const { error: sendCodeError } = await signUp.verifications.sendEmailCode();
      if (sendCodeError) {
        setFormErrors(
          normalizeClerkError(
            sendCodeError,
            "Your account was created, but we couldn't send the verification code.",
          ),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signUp) {
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
      const { error } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (error) {
        setFormErrors(
          normalizeClerkError(
            error,
            "That code didn't match. Check your inbox and try again.",
          ),
        );
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp(signUp);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!signUp) {
      return;
    }

    resetErrors();
    setIsResending(true);

    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setFormErrors(
          normalizeClerkError(
            error,
            "We couldn't send a fresh code right now.",
          ),
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  if (!signUp) {
    return null;
  }

  if (isAwaitingVerification) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="Confirm your email to secure the account and unlock your subscription workspace."
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
            helper={`We sent the code to ${emailAddress.trim() || "your email"}.`}
            placeholder="Enter the 6-digit code"
          />

          {formErrors.form ? (
            <Text className="auth-error">{formErrors.form}</Text>
          ) : null}

          <AuthButton
            title="Verify email"
            onPress={handleVerify}
            loading={isVerifying}
            disabled={!code.trim()}
          />

          <AuthSecondaryButton
            title={isResending ? "Sending code..." : "Send a new code"}
            onPress={handleResendCode}
            disabled={isResending}
          />
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking renewals, spend, and billing confidence from one polished workspace."
    >
      <View className="auth-form">
        <AuthField
          label="Work email"
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
          textContentType="newPassword"
          error={formErrors.fields.password}
          helper="Use at least 8 characters and include a number."
          placeholder="Create a password"
          rightSlot={
            <Pressable onPress={() => setShowPassword((value) => !value)}>
              <Text className="text-xs font-sans-bold text-accent">
                {showPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          }
        />

        <AuthField
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          textContentType="password"
          error={formErrors.fields.confirmPassword}
          placeholder="Re-enter your password"
          rightSlot={
            <Pressable
              onPress={() => setShowConfirmPassword((value) => !value)}
            >
              <Text className="text-xs font-sans-bold text-accent">
                {showConfirmPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          }
        />

        {formErrors.form ? (
          <Text className="auth-error">{formErrors.form}</Text>
        ) : null}

        <AuthButton
          title="Create account"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!emailAddress.trim() || !password || !confirmPassword}
        />

        <Text className="auth-helper text-center">
          By continuing, you are creating a secure Recurrly workspace for your
          billing activity.
        </Text>

        <View className="auth-link-row">
          <Text className="auth-link-copy">Already have an account?</Text>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable>
              <Text className="auth-link">Sign in</Text>
            </Pressable>
          </Link>
        </View>

        <View nativeID="clerk-captcha" />
      </View>
    </AuthShell>
  );
};

export default SignUp;
