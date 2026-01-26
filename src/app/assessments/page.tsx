"use client";

import { AssessmentCard } from "@/components/assessment-card";
import { Heading, Subheading } from "@/components/catalyst/heading";
import { Text } from "@/components/catalyst/text";
import { efyModules } from "@/components/efy-config";
import { useGrades } from "@/components/grade-context";
import { computeModulePercent, formatPercent, getModuleStatus } from "@/components/grade-utils";
import { StatusBadge } from "@/components/status-badge";

export default function AssessmentsPage() {
  const { grades } = useGrades();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Heading level={1}>Assessments</Heading>
        <Text>
          Enter marks as you receive them. Only the grades you input are used in calculations.
        </Text>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:pr-4 lg:border-r lg:border-zinc-950/5 lg:dark:border-white/10">
          <div className="lg:sticky lg:top-6">
            {efyModules.map((module) => {
              const percent = computeModulePercent(module, grades);
              return (
                <a
                  key={module.id}
                  href={`#${module.id}`}
                  className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-950/10 hover:bg-white/80 dark:text-zinc-200 dark:hover:border-white/10 dark:hover:bg-zinc-900/70"
                >
                  <span>{module.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatPercent(percent)}
                  </span>
                </a>
              );
            })}
          </div>
        </aside>

        <div className="space-y-10">
          {efyModules.map((module) => {
            const percent = computeModulePercent(module, grades);
            const status = getModuleStatus(module, grades);

            return (
              <section key={module.id} id={module.id} className="scroll-mt-24 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <Subheading level={2}>{module.name}</Subheading>
                    <Text>{module.passRule.label}</Text>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Current %</p>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={status} />
                      <p className="text-lg font-semibold text-zinc-950 dark:text-white">
                        {formatPercent(percent)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {module.assessments.map((assessment) => (
                    <AssessmentCard key={assessment.id} assessment={assessment} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
