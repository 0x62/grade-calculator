"use client";

import { usePathname } from "next/navigation";
import { StackedLayout } from "./catalyst/stacked-layout";
import { Navbar, NavbarItem, NavbarLabel, NavbarSection, NavbarDivider } from "./catalyst/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from "./catalyst/sidebar";
import { GradeProvider } from "./grade-context";
import { Heading, Subheading } from "./catalyst/heading";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/assessments", label: "Assessments" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navbar = (
    <Navbar>
      <NavbarSection>
        <Subheading level={1} className="text-xl/7 sm:text-lg/7">
          EFY Grade Tracker
        </Subheading>
      </NavbarSection>
      <NavbarDivider />
      <NavbarSection className="hidden sm:flex">
        {navItems.map((item) => (
          <NavbarItem key={item.href} href={item.href} current={pathname === item.href}>
            <NavbarLabel>{item.label}</NavbarLabel>
          </NavbarItem>
        ))}
      </NavbarSection>
    </Navbar>
  );

  const sidebar = (
    <Sidebar>
      <SidebarHeader>
        <Subheading level={2}>Engineering Foundation Year</Subheading>
        <p className="text-sm text-zinc-500">Southampton • 2025/26</p>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          {navItems.map((item) => (
            <SidebarItem key={item.href} href={item.href} current={pathname === item.href}>
              <SidebarLabel>{item.label}</SidebarLabel>
            </SidebarItem>
          ))}
        </SidebarSection>
      </SidebarBody>
    </Sidebar>
  );

  return (
    <GradeProvider>
      <StackedLayout navbar={navbar} sidebar={sidebar}>
        {children}
      </StackedLayout>
    </GradeProvider>
  );
}
