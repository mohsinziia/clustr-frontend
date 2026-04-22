export const Logo = ({ size = 24, className = "" }: { size?: number; className?: string }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" rx="20" fill="#13111C" />
      {/* Connecting lines */}
      <line x1="50" y1="50" x2="50" y2="20" stroke="#4C3A7A" strokeWidth="4" />
      <line x1="50" y1="50" x2="50" y2="80" stroke="#4C3A7A" strokeWidth="4" />
      <line x1="50" y1="50" x2="20" y2="50" stroke="#4C3A7A" strokeWidth="4" />
      <line x1="50" y1="50" x2="80" y2="50" stroke="#4C3A7A" strokeWidth="4" />
      <line x1="50" y1="50" x2="28" y2="28" stroke="#4C3A7A" strokeWidth="4" />
      <line x1="50" y1="50" x2="72" y2="28" stroke="#4C3A7A" strokeWidth="4" />
      
      {/* Outer circles */}
      <circle cx="50" cy="20" r="10" fill="#A894E6" />
      <circle cx="50" cy="80" r="10" fill="#6A5ACD" />
      <circle cx="20" cy="50" r="10" fill="#A894E6" />
      <circle cx="80" cy="50" r="10" fill="#A894E6" />
      <circle cx="28" cy="28" r="10" fill="#A894E6" />
      <circle cx="72" cy="28" r="10" fill="#A894E6" />
      
      {/* Central circle */}
      <circle cx="50" cy="50" r="18" fill="#7B68EE" />
    </svg>
  );
};
