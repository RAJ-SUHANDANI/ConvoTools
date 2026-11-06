"use client";

import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  className?: string;
  variant?: "default" | "inverse";
  width?: number;
  priority?: boolean;
};

export default function BrandLogo({
  className = "",
  variant = "default",
  width = 205,
  priority = false,
}: BrandLogoProps) {
  const src = variant === "inverse" ? "/convotools-logo-inverse.svg" : "/convotools-logo.svg";

  return (
    <Link href="/" aria-label="ConvoTools home" className={["brand-logo", className].filter(Boolean).join(" ")}>
      <Image
        src={src}
        alt="ConvoTools"
        width={width}
        height={Math.round(width * 0.225)}
        priority={priority}
        unoptimized
      />
    </Link>
  );
}
