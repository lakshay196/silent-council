import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Proposal } from "@/lib/types";

const DEMO_PROPOSALS: Proposal[] = [
  {
    id: "demo-mess",
    onchainId: "0x01",
    title: "Extend mess hours to 11pm?",
    description: "Keep dinner service open later on weeknights.",
    category: "mess",
    deadline: "2026-08-22T17:00:00.000Z",
    creatorWallet: "0x0000000000000000000000000000000000000000",
    tallyYes: 42,
    tallyNo: 11,
    tallyAbstain: 3,
    createdAt: "2026-08-18T00:00:00.000Z",
  },
  {
    id: "demo-plastic",
    onchainId: "0x02",
    title: "Ban plastic bottles in hostels?",
    description: "Switch hostel stores to refill stations only.",
    category: "hostel",
    deadline: "2026-08-22T17:00:00.000Z",
    creatorWallet: "0x0000000000000000000000000000000000000000",
    tallyYes: 28,
    tallyNo: 19,
    tallyAbstain: 7,
    createdAt: "2026-08-18T00:00:00.000Z",
  },
  {
    id: "demo-library",
    onchainId: "0x03",
    title: "Longer library hours during exams?",
    description: "Keep the library open until 2am in exam weeks.",
    category: "academic",
    deadline: "2026-08-22T17:00:00.000Z",
    creatorWallet: "0x0000000000000000000000000000000000000000",
    tallyYes: 61,
    tallyNo: 4,
    tallyAbstain: 2,
    createdAt: "2026-08-18T00:00:00.000Z",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.28),_transparent_60%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />

      <main className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-5xl flex-col px-4 py-16 sm:py-24">
        <section className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs font-medium tracking-[0.2em] text-indigo-300 uppercase">
            NITK · Base Sepolia
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Silent Council
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-zinc-300 sm:text-lg">
            Onchain voting for NITK. Verified voters, secret ballots, public
            tallies.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/verify"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 w-full bg-indigo-500 px-6 text-base text-white hover:bg-indigo-400 sm:w-auto"
              )}
            >
              Verify with NITK email
            </Link>
            <Link
              href="/proposals"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-11 w-full px-6 text-base sm:w-auto"
              )}
            >
              See live proposals
            </Link>
          </div>
          <p className="mt-3 text-sm text-zinc-400">
            Demo also accepts Gmail
          </p>
        </section>

        <section className="mt-20">
          <h2 className="mb-6 text-lg font-medium text-white">Open proposals</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_PROPOSALS.map((proposal) => (
              <Link key={proposal.id} href={`/proposals/${proposal.id}`}>
                <Card className="h-full bg-zinc-900/70 transition-colors hover:bg-zinc-900">
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit capitalize">
                      {proposal.category}
                    </Badge>
                    <CardTitle className="text-lg text-white">
                      {proposal.title}
                    </CardTitle>
                    <CardDescription>{proposal.description}</CardDescription>
                  </CardHeader>
                  <CardContent />
                  <CardFooter className="justify-between text-xs text-zinc-400">
                    <span>Yes {proposal.tallyYes}</span>
                    <span>No {proposal.tallyNo}</span>
                    <span>Abstain {proposal.tallyAbstain}</span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-6 text-center text-sm text-zinc-400">
        <a
          href="https://github.com/lakshay196/silent-council"
          className="underline-offset-4 hover:text-white hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <span className="mx-2">·</span>
        Built at Road to Devcon NITK Surathkal
      </footer>
    </div>
  );
}
