import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Container } from "@/components/shared/container";
import { AccountMenu } from "@/components/shared/account-menu";
import { AdminNav } from "@/features/admin/components/admin-nav";

/** Authenticated admin-area header. */
export function AdminHeader({
  name,
  email,
  code,
}: {
  name: string;
  email: string;
  code: string;
}) {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              aria-label="Magnus Copo admin"
              className="shrink-0"
            >
              <Logo width={120} />
            </Link>
            <span className="bg-primary/10 text-primary hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline">
              Admin
            </span>
            <AdminNav />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AccountMenu name={name} email={email} code={code} />
          </div>
        </div>
      </Container>
    </header>
  );
}
