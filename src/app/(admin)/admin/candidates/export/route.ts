import ExcelJS from "exceljs";
import { fetchCandidatesForExport, getRole } from "@/features/admin/data";
import type { CandidateFilters } from "@/features/admin/types";

export const runtime = "nodejs";

const HEADERS = [
  "Candidate ID",
  "Full Name",
  "Email",
  "Mobile",
  "WhatsApp",
  "Gender",
  "Date of Birth",
  "City",
  "State",
  "PIN",
  "College",
  "University",
  "Degree",
  "Branch",
  "Specialization",
  "Passing Year",
  "Score",
  "Profile %",
  "Status",
  "Stage",
  "Registered On",
];

function csvCell(value: string | number): string {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: Request) {
  const role = await getRole();
  if (role !== "admin" && role !== "super_admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "xlsx" ? "xlsx" : "csv";
  const filters: CandidateFilters = {
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    registration_status: searchParams.get("registration_status") ?? undefined,
    city: searchParams.get("city") ?? undefined,
    state: searchParams.get("state") ?? undefined,
    college: searchParams.get("college") ?? undefined,
    branch: searchParams.get("branch") ?? undefined,
    skill: searchParams.get("skill") ?? undefined,
    passing_year: searchParams.get("passing_year") ?? undefined,
  };

  const rows = await fetchCandidatesForExport(filters);
  const date = new Date().toISOString().slice(0, 10);

  if (format === "xlsx") {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Candidates");
    ws.columns = HEADERS.map((h) => ({ header: h, key: h, width: 18 }));
    for (const row of rows) ws.addRow(row);
    ws.getRow(1).font = { bold: true };
    const body = await wb.xlsx.writeBuffer();
    return new Response(body as ArrayBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="candidates-${date}.xlsx"`,
      },
    });
  }

  const head = HEADERS.map(csvCell).join(",");
  const lines = rows.map((r) =>
    HEADERS.map((h) => csvCell(r[h] ?? "")).join(","),
  );
  const csv = `﻿${head}\n${lines.join("\n")}`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="candidates-${date}.csv"`,
    },
  });
}
