'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, MapPin, TrendingUp, Zap } from 'lucide-react';
import type { EarthquakeStats } from '@/types';
import { cn, formatNumber, formatMagnitude } from '@/lib/utils';

interface StatsCardsProps {
  stats: EarthquakeStats | null;
  loading?: boolean;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    last24h: 0,
    last7d: 0,
    maxMag: 0,
  });

  useEffect(() => {
    if (stats) {
      // Animate numbers
      const duration = 1000;
      const steps = 30;
      const interval = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        setAnimatedStats({
          total: Math.round(stats.total * progress),
          last24h: Math.round(stats.last24h * progress),
          last7d: Math.round(stats.last7d * progress),
          maxMag: Math.round(stats.maxMagnitude * progress * 10) / 10,
        });
        
        if (step >= steps) {
          clearInterval(timer);
          setAnimatedStats({
            total: stats.total,
            last24h: stats.last24h,
            last7d: stats.last7d,
            maxMag: stats.maxMagnitude,
          });
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [stats]);

  const cards = [
    {
      id: 'total',
      label: 'Total Eventos',
      value: formatNumber(animatedStats.total),
      icon: Activity,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-400',
    },
    {
      id: '24h',
      label: 'Últimas 24h',
      value: formatNumber(animatedStats.last24h),
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-400',
    },
    {
      id: '7d',
      label: 'Últimos 7 días',
      value: formatNumber(animatedStats.last7d),
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
    },
    {
      id: 'max',
      label: 'Max Magnitud',
      value: formatMagnitude(animatedStats.maxMag),
      icon: MapPin,
      color: 'from-rose-500 to-red-500',
      textColor: 'text-rose-400',
    },
  ];

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 flex gap-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "bg-slate-900/90 backdrop-blur rounded-lg border border-slate-700 p-3 min-w-[120px]",
            "shadow-lg hover:shadow-xl transition-shadow"
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className={cn("p-1.5 rounded-md bg-gradient-to-br", card.color)}>
              <card.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs text-slate-400">{card.label}</span>
          </div>
          <div className={cn("text-xl font-bold", card.textColor)}>
            {loading ? (
              <span className="animate-pulse">...</span>
            ) : (
              card.value
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
