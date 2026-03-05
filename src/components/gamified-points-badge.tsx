"use client";

import { useState, useEffect } from "react";
import { Coins } from "lucide-react";

interface GamifiedPointsBadgeProps {
  points: number;
  previousPoints?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  onClick?: () => void;
}

export function GamifiedPointsBadge({
  points,
  previousPoints,
  size = "md",
  showLabel = false,
  onClick,
}: GamifiedPointsBadgeProps) {
  const [displayPoints, setDisplayPoints] = useState(points);

  useEffect(() => {
    if (points !== previousPoints && previousPoints !== undefined) {
      const duration = 300;
      const startTime = Date.now();
      const diff = points - previousPoints;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setDisplayPoints(Math.floor(previousPoints + diff * easeOut));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayPoints(points);
        }
      };

      animate();
    } else {
      setDisplayPoints(points);
    }
  }, [points, previousPoints]);

  const sizeClasses = {
    sm: "px-2.5 py-1 text-sm",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5
        bg-gradient-to-r from-primary to-primary/80
        rounded-full font-semibold text-white
        hover:opacity-90 active:scale-95
        transition-all duration-200
        ${sizeClasses[size]}
        ${onClick ? "cursor-pointer" : "cursor-default"}
      `}
    >
      <Coins className={iconSizes[size]} />
      <span>{displayPoints.toLocaleString()}</span>
      {showLabel && <span className="text-white/70 text-xs">STEPs</span>}
    </button>
  );
}
