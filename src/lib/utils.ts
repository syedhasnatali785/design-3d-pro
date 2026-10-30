import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cardData = [
  {
    id: 1,
    title: "Cloud POS Web Architecture",
    description: "Multi-terminal offline-first enterprise point of sale systems with millisecond sync.",
    color: "rgba(56, 189, 248, 0.8)", // Ice cyan
  },
  {
    id: 2,
    title: "Bespoke Enterprise Systems",
    description: "Custom ERPs, resilient microservices, and high-concurrency cloud backend pipelines.",
    color: "rgba(99, 102, 241, 0.8)", // Royal Indigo
  },
  {
    id: 3,
    title: "Next-Gen 3D Interactive Web",
    description: "60 FPS GPU-accelerated WebGL visuals, precision scrollytelling, and cinema-grade digital products.",
    color: "rgba(168, 85, 247, 0.8)", // Crystal Purple
  },
  {
    id: 4,
    title: "Autonomous Intelligence Layer",
    description: "Embedded neural intelligence, live customer discovery models, and smart automated workflows.",
    color: "rgba(244, 63, 94, 0.8)", // Crimson Rose
  },
]


