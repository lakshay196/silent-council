import Link from "next/link";

const STEPS = [
  {
    title: "Verify eligibility",
    body: "Your NITK identity is verified without exposing the email address publicly.",
  },
  {
    title: "Cast a private ballot",
    body: "Your vote is separated from your identity, so nobody can trace your choice back to you.",
  },
  {
    title: "Prevent double voting",
    body: "A cryptographic nullifier ensures each eligible student can vote only once per proposal.",
  },
  {
    title: "Publish the tally",
    body: "Votes are counted on Base Sepolia, making the final result public and independently verifiable.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
      <Link
        href="/"
        className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        &larr; Back home
      </Link>

      <p className="mt-12 text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-500">
        How it works
      </p>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Private by design.
        <br />
        Verifiable by anyone.
      </h1>
      <p className="mt-5 max-w-lg text-sm leading-relaxed text-zinc-400">
        Silent Council verifies who is eligible to vote without publishing who
        they are or how they voted.
      </p>

      <ol className="mt-12 divide-y divide-white/[0.06] border-y border-white/[0.06]">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="grid gap-3 py-6 sm:grid-cols-[2.5rem_1fr] sm:gap-5"
          >
            <span className="font-mono text-xs text-zinc-600">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-sm font-medium text-zinc-100">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-600">
        <span>Zero-knowledge email proof</span>
        <span>Cryptographic nullifiers</span>
        <span>Base Sepolia</span>
      </div>
    </main>
  );
}
