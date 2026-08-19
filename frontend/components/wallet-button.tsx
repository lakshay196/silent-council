"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

const PILL =
  "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors";

export function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        return (
          <div
            aria-hidden={!mounted}
            className={mounted ? undefined : "pointer-events-none select-none opacity-0"}
          >
            {!connected ? (
              <button
                type="button"
                onClick={openConnectModal}
                className={`${PILL} border-white/15 bg-white/[0.04] text-zinc-100 hover:border-white/30 hover:bg-white/[0.08]`}
              >
                Connect wallet
              </button>
            ) : chain.unsupported ? (
              <button
                type="button"
                onClick={openChainModal}
                className={`${PILL} border-rose-400/30 bg-rose-400/10 text-rose-300 hover:border-rose-400/50 hover:bg-rose-400/15`}
              >
                Wrong network
              </button>
            ) : (
              <button
                type="button"
                onClick={openAccountModal}
                className={`${PILL} border-white/10 bg-white/[0.04] tabular-nums text-zinc-200 hover:border-white/25 hover:bg-white/[0.08]`}
              >
                <span aria-hidden className="size-1.5 rounded-full bg-emerald-400" />
                {account.displayName}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
