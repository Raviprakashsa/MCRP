import { AppHeader } from "@/components/shared/app-header";
import { Container } from "@/components/shared/container";
import { requireCandidate } from "@/features/candidate/data";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const candidate = await requireCandidate();

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        name={candidate.full_name}
        email={candidate.email}
        code={candidate.candidate_code}
      />
      <main className="flex-1 py-8 sm:py-10">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
