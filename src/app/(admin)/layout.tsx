import { AdminHeader } from "@/components/shared/admin-header";
import { Container } from "@/components/shared/container";
import { requireAdmin } from "@/features/admin/data";
import { getCandidate, getUser } from "@/features/candidate/data";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const [user, candidate] = await Promise.all([getUser(), getCandidate()]);
  const email = candidate?.email ?? user?.email ?? "";
  const name = candidate?.full_name || email;
  const code = candidate?.candidate_code ?? "—";

  return (
    <div className="flex min-h-full flex-col">
      <AdminHeader name={name} email={email} code={code} />
      <main className="flex-1 py-8 sm:py-10">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
