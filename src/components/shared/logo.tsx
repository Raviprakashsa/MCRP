import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Official Magnus Copo wordmark, theme-aware.
 *
 * The source SVGs are a horizontal "MAGNUS COPO" wordmark centered inside a
 * square canvas with large empty top/bottom margins. We frame it tightly with a
 * cropped, overflow-hidden window (pure CSS — the official files are never
 * modified, recolored, or stretched; aspect ratio is preserved). Themes swap via
 * the `.dark` class so there's no hydration flash.
 *
 * `width` is the rendered wordmark width in px; the crop window height is derived
 * from the artwork's true proportions.
 */
const CROP_RATIO = 0.18; // window height as a fraction of width (wordmark band + margin)

export function Logo({
  width = 160,
  className,
}: {
  width?: number;
  className?: string;
}) {
  const height = Math.round(width * CROP_RATIO);
  const imageClass =
    "absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2";

  return (
    <span
      role="img"
      aria-label="Magnus Copo"
      className={cn("relative block overflow-hidden", className)}
      style={{ width, height }}
    >
      <Image
        src="/brand/MagnusCOPO_Light.svg"
        alt=""
        width={width}
        height={width}
        priority
        className={cn(imageClass, "block dark:hidden")}
      />
      <Image
        src="/brand/MagnusCOPO_Dark.svg"
        alt=""
        width={width}
        height={width}
        priority
        className={cn(imageClass, "hidden dark:block")}
      />
    </span>
  );
}
