import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light" | "dark";
  showTagline?: boolean;
  className?: string;
  animated?: boolean;
}

const Logo = ({ 
  size = "md", 
  variant = "default", 
  showTagline = true,
  className,
  animated = true 
}: LogoProps) => {
  const sizeConfig = {
    sm: {
      container: "h-9 w-9",
      icon: "h-5 w-5",
      letter: "text-lg",
      brand: "text-lg",
      tagline: "text-[10px]",
    },
    md: {
      container: "h-11 w-11",
      icon: "h-6 w-6",
      letter: "text-xl",
      brand: "text-xl",
      tagline: "text-xs",
    },
    lg: {
      container: "h-14 w-14",
      icon: "h-8 w-8",
      letter: "text-2xl",
      brand: "text-3xl",
      tagline: "text-sm",
    },
  };

  const variantConfig = {
    default: {
      text: "text-foreground",
      tagline: "text-muted-foreground",
    },
    light: {
      text: "text-primary-foreground",
      tagline: "text-primary-foreground/70",
    },
    dark: {
      text: "text-foreground",
      tagline: "text-muted-foreground",
    },
  };

  const config = sizeConfig[size];
  const colors = variantConfig[variant];

  const LogoContent = () => (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Mark */}
      <motion.div 
        className="relative"
        whileHover={animated ? { scale: 1.05 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {/* Outer Ring with Gradient */}
        <div className={cn(
          "relative rounded-full p-[2px] bg-gradient-to-br from-primary via-accent to-primary",
          config.container
        )}>
          {/* Inner Circle */}
          <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow">
            {/* Letter T with Scissor-like design */}
            <div className="relative flex items-center justify-center">
              <span className={cn(
                "font-serif font-bold text-primary-foreground relative z-10",
                config.letter
              )}>
                T
              </span>
              {/* Decorative accent lines */}
              <motion.div 
                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-accent rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              />
            </div>
          </div>
        </div>
        
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "100%", opacity: [0, 1, 0] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 4,
            ease: "easeInOut"
          }}
          style={{ overflow: "hidden" }}
        />
      </motion.div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className={cn(
            "font-serif font-bold tracking-tight",
            config.brand,
            colors.text
          )}>
            TESSLA
          </span>
        </div>
        {showTagline && (
          <motion.span 
            className={cn(
              "tracking-[0.2em] uppercase font-medium -mt-0.5",
              config.tagline,
              colors.tagline
            )}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Equipment Stores
          </motion.span>
        )}
      </div>
    </div>
  );

  return <LogoContent />;
};

export default Logo;
