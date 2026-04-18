import Image from "next/image";

type AppLogoProps = {
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<AppLogoProps["size"]>, string> = {
  sm: "w-28",
  md: "w-36",
  lg: "w-44",
};

export function AppLogo({
  className = "",
  priority = false,
  size = "md",
}: AppLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Kcalendar"
      width={509}
      height={103}
      priority={priority}
      className={`h-auto ${sizeClasses[size]} ${className}`.trim()}
    />
  );
}
