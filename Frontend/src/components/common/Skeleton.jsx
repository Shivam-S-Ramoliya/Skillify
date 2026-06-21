export default function Skeleton({ className = "", variant = "rect", ...props }) {
  const baseClass = "animate-pulse bg-secondary/10 dark:bg-secondary/20";
  
  // variant-specific border radius
  const variantClass = 
    variant === "circle" 
      ? "rounded-full" 
      : variant === "text" 
      ? "rounded h-4" 
      : "rounded-2xl"; // matches glass-card / rounded-2xl styles

  return (
    <div 
      className={`${baseClass} ${variantClass} ${className}`} 
      {...props} 
    />
  );
}
