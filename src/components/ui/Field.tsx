import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { useRef } from "react";
import { AlertCircle, ChevronDown, type LucideIcon } from "lucide-react";

const controlClass =
  "h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-[#0F172A] outline-none transition-colors duration-150 placeholder:text-slate-400 focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/15 disabled:bg-[#F8FAFC] disabled:text-[#64748B]";

function borderClass(error?: string) {
  return error ? "border-[#DC2626]" : "border-[#E2E8F0]";
}

type ShellProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

export function FieldShell({ id, label, required, error, children }: ShellProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-[#0F172A]"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-[#DC2626]" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-sm text-[#DC2626]"
        >
          <AlertCircle size={15} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

type BaseProps = {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
};


export function IconInput({
                            id,
                            label,
                            icon: Icon,
                            error,
                            required,
                            className = "",
                            ...rest
                          }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
      <FieldShell id={id} label={label} required={required} error={error}>
        <div className="relative">
          <Icon
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
          />

          <input
              ref={inputRef}
              id={id}
              required={required}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              onClick={() => {
                if (rest.type === "date" || rest.type === "time") {
                  try {
                    inputRef.current?.showPicker?.();
                  } catch {
                    //
                  }
                }
              }}
              className={`${controlClass} ${borderClass(error)} ${className} ${
                  rest.type === "date" || rest.type === "time"
                      ? "[&::-webkit-calendar-picker-indicator]:hidden"
                      : ""
              }`}
              {...rest}
          />
        </div>
      </FieldShell>
  );
}


export function IconSelect({
  id,
  label,
  icon: Icon,
  error,
  required,
  className = "",
  children,
  ...rest
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell id={id} label={label} required={required} error={error}>
      <div className="relative">
        <Icon
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
        />
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${controlClass} ${borderClass(error)} appearance-none pr-11 ${className}`}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B]"
        />
      </div>
    </FieldShell>
  );
}
