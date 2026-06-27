import { Container } from "@/components/shared/container";
import { siteConfig } from "@/config/site";

/** Simple public footer, aligned to the shared container grid. */
export function SiteFooter() {
  return (
    <footer className="border-border text-muted-foreground border-t">
      <Container>
        <div className="flex flex-col items-center justify-between gap-2 py-8 text-sm sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.company}. All rights
            reserved.
          </p>
          <p>Candidate Registration Portal</p>
        </div>
      </Container>
    </footer>
  );
}
