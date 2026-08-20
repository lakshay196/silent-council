"use client";

import Link from "next/link";
import { VerifiedBadge } from "@/components/verified-badge";
import { WalletButton } from "@/components/wallet-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:gap-3">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <Link
            href="/"
            className="shrink-0 text-sm font-semibold tracking-tight text-white transition-opacity hover:opacity-80"
          >
            Silent&nbsp;Council
          </Link>
          <nav className="flex items-center gap-3 text-xs sm:gap-4 sm:text-sm">
            <Link
              href="/"
              className="text-zinc-300 transition-colors hover:text-white"
            >
              Proposals
            </Link>
            <Link
              href="/verify"
              className="text-zinc-300 transition-colors hover:text-white"
            >
              Verify
            </Link>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <VerifiedBadge />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
