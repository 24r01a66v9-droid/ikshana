import { motion } from "motion/react";

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Recreating the Ikshana Logo with SVG for high resolution */}
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Three heads/circles */}
        <circle cx="25" cy="25" r="12" fill="#ff5a5f" />
        <circle cx="50" cy="25" r="12" fill="#ff5a5f" />
        <circle cx="75" cy="25" r="12" fill="#ff5a5f" />
        
        {/* Arched body structure */}
        <path 
          d="M10 55 C 10 35, 40 35, 40 55 L 40 85 M 40 55 C 40 35, 60 35, 60 55 L 60 85 M 60 55 C 60 35, 90 35, 90 55" 
          stroke="#ff5a5f" 
          strokeWidth="12" 
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
