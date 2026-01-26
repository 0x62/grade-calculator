"use client";

import { Heading, Subheading } from "@/components/catalyst/heading";
import { Button } from "@/components/catalyst/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/catalyst/table";
import { Text } from "@/components/catalyst/text";
import { efyModules } from "@/components/efy-config";
import { useGrades } from "@/components/grade-context";
import {
  computeModulePercent,
  computeOverallPercent,
  formatPercent,
  getModuleStatus,
  getOverallStatus,
  getOutstandingRequirements,
  statusMeta,
  type OutstandingRequirement,
} from "@/components/grade-utils";
import { StatusBadge } from "@/components/status-badge";

const statusCardStyles = {
  good: "from-emerald-500/20 via-emerald-500/10 to-transparent text-emerald-950",
  warn: "from-amber-500/20 via-amber-500/10 to-transparent text-amber-950",
  bad: "from-rose-500/20 via-rose-500/10 to-transparent text-rose-950",
  nodata: "from-zinc-500/15 via-zinc-500/10 to-transparent text-zinc-900",
};

type RequirementGroup = {
  moduleId: string;
  moduleName: string;
  assignments: {
    assessmentId: string;
    assessmentName: string;
    tasks: OutstandingRequirement[];
  }[];
};

function getRoundedMarks(value: number | null) {
  if (value === null || Number.isNaN(value)) return null;
  return Math.ceil(value);
}

function formatMarks(value: number | null, totalMarks: number) {
  const rounded = getRoundedMarks(value);
  if (rounded === null) return "—";
  return `${rounded} / ${totalMarks}`;
}

export default function Home() {
  const { grades } = useGrades();
  const overallStatus = getOverallStatus(efyModules, grades);
  const overallPercent = computeOverallPercent(efyModules, grades);
  const overallMeta = statusMeta[overallStatus];
  const outstandingRequirements = getOutstandingRequirements(efyModules, grades);
  const requirementGroups: RequirementGroup[] = [];
  let currentModule: RequirementGroup | null = null;
  let currentAssignment: RequirementGroup["assignments"][number] | null = null;

  for (const requirement of outstandingRequirements) {
    if (!currentModule || currentModule.moduleId !== requirement.moduleId) {
      currentModule = {
        moduleId: requirement.moduleId,
        moduleName: requirement.moduleName,
        assignments: [],
      };
      requirementGroups.push(currentModule);
      currentAssignment = null;
    }

    if (!currentAssignment || currentAssignment.assessmentId !== requirement.assessmentId) {
      currentAssignment = {
        assessmentId: requirement.assessmentId,
        assessmentName: requirement.assessmentName,
        tasks: [],
      };
      currentModule.assignments.push(currentAssignment);
    }

    currentAssignment.tasks.push(requirement);
  }

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-white/60 bg-gradient-to-br p-8 shadow-sm ring-1 ring-zinc-950/5 sm:p-10 dark:border-white/10 dark:bg-white/5 dark:ring-white/10">
        <div
          className={`rounded-2xl bg-gradient-to-br p-6 sm:p-8 ${statusCardStyles[overallStatus]} dark:text-white`}
        >
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2">
              <Text className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-300">
                Current standing
              </Text>
              <Heading level={1} className="text-3xl/10 sm:text-4xl/10">
                {overallMeta.label}
              </Heading>
              <Text className="text-base text-zinc-600 dark:text-zinc-200">
                Calculated from the assessments you have entered so far.
              </Text>
            </div>
            <div className="rounded-2xl bg-white/70 px-6 py-4 text-center shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-900/60 dark:ring-white/10">
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-300">
                Overall average
              </p>
              <p className="text-3xl font-semibold text-zinc-950 dark:text-white">
                {formatPercent(overallPercent)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {overallStatus === "nodata" ? (
        <section className="rounded-3xl border border-zinc-950/5 bg-white/80 p-8 shadow-sm ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-900/70 dark:ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2">
              <Subheading level={2}>How it works</Subheading>
              <Text className="text-zinc-600 dark:text-zinc-300">
                Add your marks as you receive them. The dashboard updates your module averages, pass
                status, and the minimum scores needed on remaining tasks. All data is stored locally
                in your browser, no information is collected.
              </Text>
            </div>
            <Button href="/assessments">Add marks</Button>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Subheading level={2}>Module breakdown</Subheading>
            <Text>Pass rules and current percentages based on entered grades.</Text>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-950/5 bg-white/80 shadow-sm px-6 sm:px-8 ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-900/70 dark:ring-white/10">
          <Table striped bleed className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
            <TableHead>
              <tr>
                <TableHeader>Module</TableHeader>
                <TableHeader>Pass rule</TableHeader>
                <TableHeader>Current %</TableHeader>
                <TableHeader>Status</TableHeader>
              </tr>
            </TableHead>
            <TableBody>
              {efyModules.map((module) => {
                const percent = computeModulePercent(module, grades);
                const status = getModuleStatus(module, grades);

                return (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">{module.name}</TableCell>
                    <TableCell>{module.passRule.label}</TableCell>
                    <TableCell>{formatPercent(percent)}</TableCell>
                    <TableCell>
                      <StatusBadge status={status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Subheading level={2}>Minimum marks to pass</Subheading>
            <Text>
              You need at least these marks on your outstanding assignments to pass the module.
            </Text>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-950/5 bg-white/80 shadow-sm px-6 sm:px-8  ring-1 ring-zinc-950/5 dark:border-white/10 dark:bg-zinc-900/70 dark:ring-white/10">
          {outstandingRequirements.length === 0 ? (
            <div className="p-6">
              <Text>All grades have been entered.</Text>
            </div>
          ) : (
            <Table bleed className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
              <TableHead>
                <tr>
                  <TableHeader>Module</TableHeader>
                  <TableHeader>Assignment</TableHeader>
                  <TableHeader>Task</TableHeader>
                  <TableHeader>Minimum mark</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {requirementGroups.map((moduleGroup) => {
                  return moduleGroup.assignments.flatMap((assignment) => {
                    return assignment.tasks.map((task) => {
                      const roundedMarks = getRoundedMarks(task.requiredMarks);
                      const displayPercent =
                        roundedMarks !== null
                          ? (roundedMarks / task.totalMarks) * 100
                          : task.requiredPercent;

                      return (
                        <TableRow key={task.taskId}>
                          <TableCell className="font-medium">{moduleGroup.moduleName}</TableCell>
                          <TableCell>{assignment.assessmentName}</TableCell>
                          <TableCell>{task.taskName ? task.taskName : <Text>—</Text>}</TableCell>
                          <TableCell>
                            {task.possible && task.requiredMarks !== null ? (
                              <div className="space-y-1">
                                <p className="font-medium text-zinc-950 dark:text-white">
                                  {formatMarks(task.requiredMarks, task.totalMarks)}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {formatPercent(displayPercent)}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="font-medium text-zinc-950 dark:text-white">
                                  Not possible
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                  {task.reason ?? "Needs more than full marks"}
                                </p>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    });
                  });
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}
