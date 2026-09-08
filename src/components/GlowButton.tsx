import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface GlowButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'glass' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'right',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs font-semibold rounded-full tracking-wide',
    md: 'px-6 py-3 text-sm font-semibold rounded-full tracking-wide',
    lg: 'px-8 py-3.5 text-base font-bold rounded-full tracking-wide shadow-md',
    xl: 'px-9 py-4 text-lg font-extrabold rounded-full tracking-wider shadow-lg',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 text-white shadow-pink-500/30 hover:shadow-pink-500/60 border border-pink-300/30',
    secondary:
      'bg-white/80 hover:bg-white text-pink-600 border border-pink-200 shadow-sm hover:border-pink-400 hover:text-pink-700 backdrop-blur-md',
    glass:
      'bg-white/60 hover:bg-white/90 text-pink-700 border border-pink-200/60 backdrop-blur-md shadow-sm',
    accent:
      'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-fuchsia-500/30 hover:shadow-fuchsia-500/60 border border-fuchsia-300/30',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`glow-btn inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </motion.button>
  );
};
