"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { selectClass } from "@/features/candidate/components/field";

export function CandidateFilters() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [status, setStatus] = useState(sp.get("status") ?? "");
  const [reg, setReg] = useState(sp.get("registration_status") ?? "");
  const [city, setCity] = useState(sp.get("city") ?? "");
  const [state, setState] = useState(sp.get("state") ?? "");
  const [college, setCollege] = useState(sp.get("college") ?? "");
  const [branch, setBranch] = useState(sp.get("branch") ?? "");
  const [skill, setSkill] = useState(sp.get("skill") ?? "");
  const [year, setYear] = useState(sp.get("passing_year") ?? "");

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const set = (k: string, v: string) => v.trim() && params.set(k, v.trim());
    set("q", q);
    if (status) params.set("status", status);
    if (reg) params.set("registration_status", reg);
    set("city", city);
    set("state", state);
    set("college", college);
    set("branch", branch);
    set("skill", skill);
    set("passing_year", year);
    router.push(`/admin/candidates?${params.toString()}`);
  };

  const clear = () => {
    setQ("");
    setStatus("");
    setReg("");
    setCity("");
    setState("");
    setCollege("");
    setBranch("");
    setSkill("");
    setYear("");
    router.push("/admin/candidates");
  };

  return (
    <form
      onSubmit={apply}
      className="border-border bg-card grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <div className="relative sm:col-span-2">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, email, mobile, ID…"
          className="pl-8"
          aria-label="Search candidates"
        />
      </div>
      <select
        className={selectClass}
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-label="Status"
      >
        <option value="">Any status</option>
        <option value="active">Active</option>
        <option value="disabled">Disabled</option>
      </select>
      <select
        className={selectClass}
        value={reg}
        onChange={(e) => setReg(e.target.value)}
        aria-label="Stage"
      >
        <option value="">Any stage</option>
        <option value="registered">Registered</option>
        <option value="email_verified">Email verified</option>
        <option value="profile_started">Profile started</option>
        <option value="resume_uploaded">Resume uploaded</option>
        <option value="profile_completed">Profile completed</option>
      </select>
      <Input
        value={college}
        onChange={(e) => setCollege(e.target.value)}
        placeholder="College"
        aria-label="College"
      />
      <Input
        value={branch}
        onChange={(e) => setBranch(e.target.value)}
        placeholder="Branch"
        aria-label="Branch"
      />
      <Input
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        placeholder="Skill"
        aria-label="Skill"
      />
      <Input
        value={year}
        onChange={(e) => setYear(e.target.value)}
        placeholder="Passing year"
        inputMode="numeric"
        aria-label="Passing year"
      />
      <Input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="City"
        aria-label="City"
      />
      <Input
        value={state}
        onChange={(e) => setState(e.target.value)}
        placeholder="State"
        aria-label="State"
      />
      <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
        <Button type="submit" size="sm">
          <Search /> Apply
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={clear}>
          <X /> Clear
        </Button>
      </div>
    </form>
  );
}
