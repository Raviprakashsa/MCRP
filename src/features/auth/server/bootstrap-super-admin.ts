import "server-only";
import { getServerEnv } from "@/lib/env.server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Environment-based super-admin bootstrap.
 *
 * If the signed-in user's email matches `SUPER_ADMIN_EMAIL`, ensure they hold
 * the `super_admin` role. Idempotent and safe to call after every sign-in;
 * it only writes when an upgrade is actually needed. Manual SQL promotion
 * remains available as a fallback (see docs/deployment/supabase-setup.md).
 */
export async function ensureSuperAdmin(
  userId: string,
  email: string | null | undefined,
): Promise<void> {
  const { SUPER_ADMIN_EMAIL } = getServerEnv();
  if (!SUPER_ADMIN_EMAIL || !email) return;
  if (email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) return;

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.role === "super_admin") return;

  await admin
    .from("user_roles")
    .upsert(
      { user_id: userId, role: "super_admin" },
      { onConflict: "user_id" },
    );
}
