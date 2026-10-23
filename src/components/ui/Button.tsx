import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-[#4F46E5] text-white shadow-sm hover:bg-[#4338CA] active:bg-[#4338CA]",
  secondary:
    "border border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#818CF8] hover:bg-[#EEF2FF]",
  ghost: "text-[#64748B] hover:bg-[#EEF2FF] hover:text-[#4F46E5]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {loading && (
        <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
