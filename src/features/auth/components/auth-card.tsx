import Link from "next/link";
import { Logo } from "@/components/shared/logo";

/** Centered, premium card shell used by all auth screens. */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-9rem)] w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-[480px]">
        <Link
          href="/"
          aria-label="Magnus Copo home"
          className="mb-7 flex justify-center"
        >
          <Logo width={180} />
        </Link>

        <div className="border-border bg-card rounded-2xl border p-8 shadow-sm sm:p-10">
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-sm text-pretty">
                {description}
              </p>
            ) : null}
          </div>
          {children}
        </div>

        {footer ? (
          <div className="text-muted-foreground mt-6 text-center text-sm">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
