import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TrendDirection } from '../../types';

interface Props {
  trend: TrendDirection;
  size?: number;
  invertColor?: boolean; // when going up is BAD (e.g. CO2, radiation)
}

export default function TrendIcon({ trend, size = 14, invertColor = false }: Props) {
  if (trend === 'up') {
    const color = invertColor ? 'text-red-400' : 'text-green-400';
    return <TrendingUp size={size} className={color} />;
  }
  if (trend === 'down') {
    const color = invertColor ? 'text-green-400' : 'text-red-400';
    return <TrendingDown size={size} className={color} />;
  }
  return <Minus size={size} className="text-slate-400" />;
}
