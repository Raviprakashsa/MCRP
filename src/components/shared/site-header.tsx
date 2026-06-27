import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Container } from "@/components/shared/container";
import { buttonVariants } from "@/components/ui/button";

/** Public header for unauthenticated pages (landing, auth screens). */
export function SiteHeader() {
  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <Container>
        <div className="flex h-18 items-center justify-between">
          <Link href="/" aria-label="Magnus Copo home" className="shrink-0">
            <Logo width={150} />
          </Link>
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Login
            </Link>
            <Link href="/register" className={buttonVariants({ size: "sm" })}>
              Register
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
