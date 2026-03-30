export const formatCurrency = (
  value: number | string,
  currency: string = "INR"
) => {
  const numericValue =
    typeof value === "number" ? value : Number.parseFloat(value);

  if (!Number.isFinite(numericValue)) {
    return currency.toUpperCase() === "INR" ? "₹0.00" : `${currency} 0.00`;
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    const absoluteValue = Math.abs(numericValue).toFixed(2);
    const [integerPart, decimalPart] = absoluteValue.split(".");
    const lastThreeDigits = integerPart.slice(-3);
    const otherDigits = integerPart.slice(0, -3);
    const formattedInteger = otherDigits
      ? `${otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThreeDigits}`
      : lastThreeDigits;
    const symbol = currency.toUpperCase() === "INR" ? "₹" : currency.toUpperCase();
    const sign = numericValue < 0 ? "-" : "";

    return `${sign}${symbol}${formattedInteger}.${decimalPart}`;
  }
};
