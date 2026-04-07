type ClerkFieldErrorMap = Record<string, string>;

type ClerkErrorEntry = {
  code?: string;
  longMessage?: string;
  message?: string;
  meta?: {
    paramName?: string;
    name?: string;
  };
};

type ClerkErrorShape = {
  errors?: ClerkErrorEntry[];
};

export type AuthFormErrors = {
  form?: string;
  fields: ClerkFieldErrorMap;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value: string): boolean =>
  EMAIL_REGEX.test(value.trim());

export const isStrongPassword = (value: string): boolean =>
  value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);

export const validateSignIn = ({
  emailAddress,
  password,
}: {
  emailAddress: string;
  password: string;
}): AuthFormErrors => {
  const fields: ClerkFieldErrorMap = {};

  if (!emailAddress.trim()) {
    fields.emailAddress = "Enter the email for your workspace.";
  } else if (!isValidEmail(emailAddress)) {
    fields.emailAddress = "Enter a valid email address.";
  }

  if (!password) {
    fields.password = "Enter your password.";
  }

  return { fields };
};

export const validateSignUp = ({
  emailAddress,
  password,
  confirmPassword,
}: {
  emailAddress: string;
  password: string;
  confirmPassword: string;
}): AuthFormErrors => {
  const errors = validateSignIn({ emailAddress, password });

  if (password && !isStrongPassword(password)) {
    errors.fields.password =
      "Use at least 8 characters and include a number.";
  }

  if (!confirmPassword) {
    errors.fields.confirmPassword = "Confirm your password.";
  } else if (password !== confirmPassword) {
    errors.fields.confirmPassword = "Passwords do not match.";
  }

  return errors;
};

export const validateVerificationCode = (code: string): AuthFormErrors => {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    return {
      fields: {
        code: "Enter the verification code sent to your email.",
      },
    };
  }

  if (!/^\d{6}$/.test(trimmedCode)) {
    return {
      fields: {
        code: "Enter the 6-digit code from your inbox.",
      },
    };
  }

  return { fields: {} };
};

const isClerkErrorShape = (value: unknown): value is ClerkErrorShape =>
  typeof value === "object" &&
  value !== null &&
  "errors" in value &&
  Array.isArray((value as ClerkErrorShape).errors);

export const normalizeClerkError = (
  error: unknown,
  fallbackMessage: string,
): AuthFormErrors => {
  if (!isClerkErrorShape(error) || !error.errors?.length) {
    return {
      form: fallbackMessage,
      fields: {},
    };
  }

  const fields: ClerkFieldErrorMap = {};

  for (const item of error.errors) {
    const fieldName = item.meta?.paramName ?? item.meta?.name;
    const message = item.longMessage ?? item.message ?? fallbackMessage;

    if (fieldName) {
      fields[toClientFieldName(fieldName)] = message;
    }
  }

  return {
    form: error.errors[0]?.longMessage ?? error.errors[0]?.message ?? fallbackMessage,
    fields,
  };
};

const toClientFieldName = (value: string): string => {
  if (value === "identifier") {
    return "emailAddress";
  }

  return value.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase());
};
