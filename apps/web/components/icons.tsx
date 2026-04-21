type IconProps = {
  className?: string;
};

function SvgIcon({
  className = "",
  children,
  viewBox = "0 0 24 24",
  fill = "none",
}: IconProps & {
  children: React.ReactNode;
  viewBox?: string;
  fill?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox={viewBox}
      fill={fill}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export function TodayIcon({
  active: _active,
  className = "",
}: IconProps & { active: boolean }) {
  return (
    <SvgIcon className={className} fill="none">
      <rect x="3.5" y="5" width="17" height="15.5" rx="3.2" />
      <path d="M7.5 3.5v4" />
      <path d="M16.5 3.5v4" />
      <path d="M3.5 9.5h17" />
      <circle cx="12" cy="14.5" r="2.2" fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}

export function WeeklyIcon({
  active: _active,
  className = "",
}: IconProps & { active: boolean }) {
  return (
    <SvgIcon className={className} fill="none">
      <rect x="3.5" y="4" width="17" height="16" rx="3.2" />
      <path d="M7 15.5V12.5" />
      <path d="M12 15.5V9.5" />
      <path d="M17 15.5V7.5" />
      <path d="M7 17.5h10" />
    </SvgIcon>
  );
}

export function ArrowRightIcon({ className = "" }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M5 12h13" />
      <path d="m13 7 5 5-5 5" />
    </SvgIcon>
  );
}

export function ArrowLeftIcon({ className = "" }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M19 12H6" />
      <path d="m11 7-5 5 5 5" />
    </SvgIcon>
  );
}

export function ChevronLeftIcon({ className = "" }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="m14.5 6.5-5 5 5 5" />
    </SvgIcon>
  );
}

export function ChevronRightIcon({ className = "" }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="m9.5 6.5 5 5-5 5" />
    </SvgIcon>
  );
}

export function CloseIcon({ className = "" }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </SvgIcon>
  );
}

export function MoreVerticalIcon({ className = "" }: IconProps) {
  return (
    <SvgIcon className={className} viewBox="0 0 24 24">
      <circle cx="12" cy="5.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18.5" r="1.3" fill="currentColor" stroke="none" />
    </SvgIcon>
  );
}

export function EditIcon({ className = "" }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M4 20h4.2l9.4-9.4a1.8 1.8 0 0 0 0-2.6l-1.6-1.6a1.8 1.8 0 0 0-2.6 0L4 15.8V20Z" />
      <path d="m11.5 8.5 4 4" />
    </SvgIcon>
  );
}

export function DeleteIcon({ className = "" }: IconProps) {
  return (
    <SvgIcon className={className}>
      <path d="M5 7h14" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M7 7l.8 11.2A1.8 1.8 0 0 0 9.6 20h4.8a1.8 1.8 0 0 0 1.8-1.8L17 7" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </SvgIcon>
  );
}
