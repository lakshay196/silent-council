import { notFound } from "next/navigation";
import { ProposalView } from "./proposal-view";
import { getProposal } from "@/lib/proposals";

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposal = await getProposal(id);
  if (!proposal) notFound();
  return <ProposalView proposal={proposal} />;
}
