import { AppHeader } from "@/components/shared/app-header";
import { Container } from "@/components/shared/container";
import { requireCandidate } from "@/features/candidate/data";
import { getRole } from "@/features/admin/data";

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const candidate = await requireCandidate();
  const role = await getRole();
  const isAdmin = role === "admin" || role === "super_admin";

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        name={candidate.full_name}
        email={candidate.email}
        code={candidate.candidate_code}
        isAdmin={isAdmin}
      />
      <main className="flex-1 py-8 sm:py-10">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
