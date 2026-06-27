"use client";

import Link from "next/link";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { signOutAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu({
  name,
  email,
  code,
  isAdmin = false,
}: {
  name: string;
  email: string;
  code: string;
  isAdmin?: boolean;
}) {
  const initials = (name.trim()[0] ?? "C").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Account menu"
          />
        }
      >
        <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-sm font-semibold">
          {initials}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="px-1.5 py-1.5">
          <span className="block truncate text-sm font-medium">
            {name || "Candidate"}
          </span>
          <span className="text-muted-foreground block truncate text-xs">
            {email}
          </span>
          <span className="text-muted-foreground mt-0.5 block font-mono text-[11px]">
            {code}
          </span>
        </div>
        <DropdownMenuSeparator />
        {isAdmin ? (
          <>
            <DropdownMenuItem render={<Link href="/admin" />}>
              <Shield /> Admin panel
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem render={<Link href="/dashboard" />}>
          <LayoutDashboard /> Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/profile" />}>
          <User /> My profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/resume" />}>
          <FileText /> Resume
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void signOutAction();
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
