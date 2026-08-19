"use client";

import Link from "next/link";
import { VerifiedBadge } from "@/components/verified-badge";
import { WalletButton } from "@/components/wallet-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-80"
        >
          Silent&nbsp;Council
        </Link>
        <div className="flex items-center gap-3">
          <VerifiedBadge />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
