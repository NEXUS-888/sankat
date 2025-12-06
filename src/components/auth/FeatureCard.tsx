import { motion } from 'framer-motion';
import './FeatureCard.css';

interface FeatureCardProps {
  title: string;
  description: string;
  severity: 'urgent' | 'general';
  icon: string;
  index: number;
  mousePosition: { x: number; y: number };
}

export function FeatureCard({ title, description, severity, icon, index, mousePosition }: FeatureCardProps) {
  return (
    <motion.div
      className={`feature-card ${severity}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.5 + index * 0.1, type: 'spring', stiffness: 200 }}
      whileHover={{ 
        scale: 1.05, 
        y: -5,
        boxShadow: severity === 'urgent' 
          ? '0 10px 40px rgba(255, 68, 68, 0.4)' 
          : '0 10px 40px rgba(68, 170, 255, 0.4)'
      }}
      style={{
        transform: `perspective(1000px) translateX(${mousePosition.x * 5}px) translateY(${mousePosition.y * 5}px)`,
      }}
    >
      <div className="feature-glow" />
      <div className="feature-content">
        <span className="feature-icon">{icon}</span>
        <div className="feature-text">
          <h3 className="feature-title">{title}</h3>
          <p className="feature-description">{description}</p>
        </div>
      </div>
      <div className="feature-border" />
    </motion.div>
  );
}
