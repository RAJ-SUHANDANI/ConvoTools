"use client";

import { MotionConfig } from "motion/react";
import { AnimateUIProvider } from "@animate-ui/react/provider";

export default function MotionPolicy({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimateUIProvider tempo={0.92} reducedMotion="user"><MotionConfig reducedMotion="user">{children}</MotionConfig></AnimateUIProvider>;
}
