import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Container } from "@/components/shared/container";
import { NavLinks } from "@/components/shared/nav-links";
import { AccountMenu } from "@/components/shared/account-menu";

/** Authenticated app header (candidate area). */
export function AppHeader({
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
          <div className="flex items-center gap-6">
            <Link href="/dashboard" aria-label="Magnus Copo" className="shrink-0">
              <Logo width={132} />
            </Link>
            <NavLinks />
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
