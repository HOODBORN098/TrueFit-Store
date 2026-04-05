

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'auto';
}

export function Logo({ className = '', showText = true, size = 'auto' }: LogoProps) {
  const sizes = {
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-16',
    auto: 'h-full w-auto'
  };

  const navy = '#001F3F';
  const gold = '#D4AF37';

  return (
    <div className={`flex items-center gap-3 ${className} ${sizes[size]}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto overflow-visible"
        aria-hidden="true"
      >
        {/* Hanger Body */}
        <path
          d="M50 25C50 25 45 25 45 30C45 35 50 35 50 35V40L15 70H85L50 40V35"
          stroke={navy}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Hanger Hook */}
        <path
          d="M50 25C55 25 60 30 60 35"
          stroke={navy}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Golden Checkmark Swoosh */}
        <path
          d="M35 60L50 75L90 35"
          stroke={gold}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />
      </svg>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span className="text-xl font-black uppercase tracking-tighter text-[#001F3F] -mb-1">
            TrueFIT
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#001F3F]">
            Clothing
          </span>
        </div>
      )}
    </div>
  );
}
