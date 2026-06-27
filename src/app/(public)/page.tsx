import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, UserPlus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/shared/container";

const features = [
  {
    icon: UserPlus,
    title: "Quick registration",
    description:
      "Create your account in under a minute, then complete your profile step by step at your own pace.",
  },
  {
    icon: FileText,
    title: "One profile, always current",
    description:
      "Keep your education, skills, and resume in one place and update them anytime — no more scattered forms.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & private",
    description:
      "Your data is protected with strong authentication and strict, row-level access controls.",
  },
];

const maskStyle = {
  WebkitMaskImage:
    "radial-gradient(ellipse 60% 60% at 50% 0%, #000 30%, transparent 75%)",
  maskImage:
    "radial-gradient(ellipse 60% 60% at 50% 0%, #000 30%, transparent 75%)",
} as const;

export default function HomePage() {
  return (
    <>
      <section className="border-border relative overflow-hidden border-b">
        {/* Branded blueprint grid + soft brand glow */}
        <div
          aria-hidden
          className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-50"
          style={maskStyle}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 45% at 50% 0%, color-mix(in oklab, var(--brand) 13%, transparent), transparent 70%)",
          }}
        />
        <Container className="relative">
          <div className="mx-auto flex max-w-3xl flex-col items-center py-20 text-center sm:py-28">
            <span className="border-border bg-background/70 text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur">
              <span className="bg-brand size-1.5 rounded-full" />
              AI-Powered IT Solutions &amp; Learning Ecosystem
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
              Build the profile that gets you{" "}
              <span className="text-brand">hired</span>.
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg text-pretty">
              Register once and keep your skills, education, and resume in one
              secure place — ready whenever Magnus Copo matches you to the right
              opportunity.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className={buttonVariants({ size: "lg" })}>
                Create your profile <ArrowRight />
              </Link>
              <Link
                href="/login"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Login
              </Link>
            </div>
            <p className="text-muted-foreground mt-8 text-xs">
              Trusted by students, colleges, and corporate partners.
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <section className="grid gap-5 py-16 sm:grid-cols-3 sm:py-20">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group border-border bg-card hover:border-primary/40 flex flex-col rounded-2xl border p-7 transition-[color,box-shadow,border-color] hover:shadow-md"
            >
              <span className="bg-primary/10 text-primary inline-flex size-12 items-center justify-center rounded-xl">
                <Icon className="size-6" />
              </span>
              <h2 className="mt-5 text-lg font-semibold">{title}</h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </section>
      </Container>
    </>
  );
}
