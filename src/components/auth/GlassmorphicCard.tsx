import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import './GlassmorphicCard.css';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  mousePosition: { x: number; y: number };
}

export function GlassmorphicCard({ children, className = '', mousePosition }: GlassmorphicCardProps) {
  return (
    <motion.div
      className={`glassmorphic-card ${className}`}
      style={{
        transform: `perspective(1000px) rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)`,
      }}
      whileHover={{
        scale: 1.01,
        boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="card-shimmer" />
      <div className="card-rim-light" />
      <div className="card-content">{children}</div>
    </motion.div>
  );
}
