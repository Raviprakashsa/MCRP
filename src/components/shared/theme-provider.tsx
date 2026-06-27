"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * App-wide theme provider (light/dark) backed by `next-themes`.
 * Uses the `class` strategy so it toggles the `.dark` class consumed by our
 * design tokens in `globals.css`. Configured once in the root layout.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
