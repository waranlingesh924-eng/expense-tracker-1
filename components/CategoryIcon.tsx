import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Home,
  HeartPulse,
  Film,
  GraduationCap,
  Briefcase,
  Laptop,
  TrendingUp,
  Store,
  Building,
  Gift,
  Tag,
  PawPrint,
  DollarSign,
  Coffee,
  Plane,
  Smartphone,
  Shield,
  BookOpen,
  Wifi,
  Package,
  PiggyBank
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = "w-5 h-5", size = 20 }) => {
  const iconMap: Record<string, React.ElementType> = {
    Utensils,
    Car,
    ShoppingBag,
    Zap,
    Home,
    HeartPulse,
    Film,
    GraduationCap,
    Briefcase,
    Laptop,
    TrendingUp,
    Store,
    Building,
    Gift,
    Tag,
    PawPrint,
    DollarSign,
    Coffee,
    Plane,
    Smartphone,
    Shield,
    BookOpen,
    Wifi,
    Package,
    PiggyBank
  };

  const IconComponent = iconMap[name] || Tag;
  return <IconComponent className={className} size={size} />;
};
