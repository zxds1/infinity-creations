interface LogoMarkProps {
  className?: string;
}

export default function LogoMark({ className = 'h-10 w-10' }: LogoMarkProps) {
  return (
    <img
      src="/maridadi-icon.svg"
      alt="Maridadi Creations"
      className={`${className} shrink-0 object-contain`}
    />
  );
}
