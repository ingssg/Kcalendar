"use client";

interface Option<T extends string> {
  value: T;
  label: string;
}

interface ButtonGroupProps<T extends string> {
  options: Option<T>[];
  value: T | null;
  onChange: (value: T) => void;
  size?: "lg" | "pill";
  bordered?: boolean;
}

export function ButtonGroup<T extends string>({
  options,
  value,
  onChange,
  size = "pill",
  bordered = false,
}: ButtonGroupProps<T>) {
  if (size === "lg") {
    return (
      <div className="flex gap-4">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-4 rounded-md font-body text-sm font-medium transition-colors duration-200 ${
              value === opt.value
                ? "bg-primary text-on-primary"
                : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          data-shadow="none"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-full font-label text-xs font-medium tracking-wide transition-all duration-200${
            bordered ? " border" : ""
          } ${
            value === opt.value
              ? `bg-on-surface-variant text-surface${bordered ? " border-on-surface-variant" : ""}`
              : `bg-surface-container-high text-on-surface-variant hover:text-on-surface${bordered ? " border-outline-variant" : ""}`
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
