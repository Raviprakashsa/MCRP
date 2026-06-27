import { cn } from "@/lib/utils";

/**
 * Shared page container: one consistent max-width and responsive horizontal
 * padding used by the navbar, hero, cards, and footer so everything aligns to
 * the same grid.
 */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
