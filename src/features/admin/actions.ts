"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  personalSchema,
  type PersonalInput,
} from "@/features/candidate/schemas";
import { getRole } from "./data";

export type AdminActionResult =
  | { ok: true }
  | {
      ok: false;
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

function nz(v: string | undefined | null): string | null {
  return v && v.trim() !== "" ? v.trim() : null;
}

/** Ensure the caller is an admin and return their session + id. */
async function requireAdminSession() {
  const role = await getRole();
  if (role !== "admin" && role !== "super_admin") redirect("/dashboard");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, uid: user.id };
}

type AuditAction = "update" | "disable" | "enable" | "delete" | "export";

async function writeAudit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  uid: string,
  action: AuditAction,
  entityId: string,
  changes?: Record<string, unknown>,
) {
  await supabase.from("audit_logs").insert({
    actor_id: uid,
    action,
    entity: "candidate",
    entity_id: entityId,
    changes: changes ?? null,
  });
}

export async function setCandidateStatus(
  id: string,
  status: "active" | "disabled",
): Promise<AdminActionResult> {
  const { supabase, uid } = await requireAdminSession();
  const { error } = await supabase
    .from("candidates")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(
    supabase,
    uid,
    status === "disabled" ? "disable" : "enable",
    id,
  );
  revalidatePath("/admin/candidates");
  revalidatePath(`/admin/candidates/${id}`);
  return { ok: true };
}

export async function softDeleteCandidate(
  id: string,
): Promise<AdminActionResult> {
  const { supabase, uid } = await requireAdminSession();
  const { error } = await supabase
    .from("candidates")
    .update({ deleted_at: new Date().toISOString(), status: "disabled" })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await writeAudit(supabase, uid, "delete", id);
  revalidatePath("/admin/candidates");
  redirect("/admin/candidates");
}

export async function updateCandidatePersonal(
  id: string,
  input: PersonalInput,
): Promise<AdminActionResult> {
  const parsed = personalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  const { supabase, uid } = await requireAdminSession();
  const d = parsed.data;

  const { error } = await supabase
    .from("candidates")
    .update({
      full_name: d.full_name.trim(),
      mobile: d.mobile.trim(),
      whatsapp: nz(d.whatsapp),
      date_of_birth: nz(d.date_of_birth),
      gender: d.gender ? d.gender : null,
      address: nz(d.address),
      city: d.city.trim(),
      state: d.state.trim(),
      pin_code: nz(d.pin_code),
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        fieldErrors: { mobile: ["This mobile number is already in use."] },
      };
    }
    return { ok: false, error: error.message };
  }

  await writeAudit(supabase, uid, "update", id, { section: "personal" });
  revalidatePath(`/admin/candidates/${id}`);
  revalidatePath("/admin/candidates");
  redirect(`/admin/candidates/${id}`);
}
