import clsx from "clsx";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
  helper?: string;
  rightSlot?: React.ReactNode;
};

export const AuthField = ({
  label,
  error,
  helper,
  rightSlot,
  className,
  ...props
}: FieldProps) => {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View className="relative">
        <TextInput
          placeholderTextColor="rgba(8, 17, 38, 0.45)"
          className={clsx(
            "auth-input",
            error && "auth-input-error",
            rightSlot && "pr-14",
            className,
          )}
          {...props}
        />
        {rightSlot ? (
          <View className="absolute inset-y-0 right-4 items-center justify-center">
            {rightSlot}
          </View>
        ) : null}
      </View>
      {error ? <Text className="auth-error">{error}</Text> : null}
      {!error && helper ? <Text className="auth-helper">{helper}</Text> : null}
    </View>
  );
};

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export const AuthButton = ({
  title,
  onPress,
  disabled,
  loading,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={clsx("auth-button", isDisabled && "auth-button-disabled")}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#081126" />
      ) : (
        <Text className="auth-button-text">{title}</Text>
      )}
    </Pressable>
  );
};

type SecondaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export const AuthSecondaryButton = ({
  title,
  onPress,
  disabled,
}: SecondaryButtonProps) => {
  return (
    <Pressable
      className={clsx(
        "auth-secondary-button",
        disabled && "opacity-45",
      )}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className="auth-secondary-button-text">{title}</Text>
    </Pressable>
  );
};
