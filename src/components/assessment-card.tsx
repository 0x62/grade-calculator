"use client";

import { useState } from "react";
import clsx from "clsx";
import type { AssessmentConfig, SubtaskConfig } from "./efy-config";
import { Badge } from "./catalyst/badge";
import { Input } from "./catalyst/input";
import { Text } from "./catalyst/text";
import { Button } from "./catalyst/button";
import { useGrades } from "./grade-context";
import { computeAssessmentPercent, formatPercent } from "./grade-utils";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      data-slot="icon"
      viewBox="0 0 20 20"
      className={clsx("size-4 transition-transform", open ? "rotate-180" : "rotate-0")}
    >
      <path
        d="M5.25 7.5 10 12.25 14.75 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getAssessmentWeight(assessment: AssessmentConfig) {
  if (assessment.subtasks && assessment.subtasks.length > 0) {
    return assessment.subtasks.reduce((sum, subtask) => sum + subtask.weight, 0);
  }
  return assessment.weight ?? 0;
}

function ScoreInput({ id, totalMarks }: { id: string; totalMarks: number }) {
  const { grades, setGrade } = useGrades();
  const value = grades[id];
  const displayValue = value === null || value === undefined ? "" : String(value);

  return (
    <Input
      type="number"
      min={0}
      max={totalMarks}
      step="0.1"
      placeholder={`0 / ${totalMarks}`}
      value={displayValue}
      onChange={(event) => {
        const nextValue = event.target.value;
        if (nextValue === "") {
          setGrade(id, null);
          return;
        }
        const parsed = Number(nextValue);
        setGrade(id, Number.isNaN(parsed) ? null : parsed);
      }}
    />
  );
}

function SubtaskRow({ subtask }: { subtask: SubtaskConfig }) {
  return (
    <div className="grid px-5 gap-3 py-4 sm:grid-cols-[1fr_120px] sm:items-center">
      <div>
        <p className="text-sm font-medium text-zinc-950 dark:text-white">{subtask.name}</p>
        <Text className="text-xs">
          Weight {subtask.weight}% · Out of {subtask.totalMarks}
        </Text>
      </div>
      <ScoreInput id={subtask.id} totalMarks={subtask.totalMarks} />
    </div>
  );
}

export function AssessmentCard({ assessment }: { assessment: AssessmentConfig }) {
  const { grades } = useGrades();
  const [open, setOpen] = useState(false);
  const hasSubtasks = !!assessment.subtasks && assessment.subtasks.length > 0;
  const percent = computeAssessmentPercent(assessment, grades);
  const weight = getAssessmentWeight(assessment);

  return (
    <div className="rounded-2xl border border-zinc-950/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-zinc-900/70">
      <div className="relative p-5">
        {hasSubtasks ? (
          <button
            className="absolute inset-0 cursor-pointer"
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="sr-only">Expand subtasks</span>
          </button>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-zinc-950 dark:text-white">
              {assessment.name}
            </p>
            <Text className="text-sm">
              Weight {formatPercent(weight)}
              {!hasSubtasks && assessment.totalMarks ? (
                <> &middot; Out of {assessment.totalMarks} marks</>
              ) : null}
            </Text>
          </div>

          <div className="flex items-center gap-3">
            {hasSubtasks ? (
              <Badge color="zinc">{formatPercent(percent)}</Badge>
            ) : (
              <div className="min-w-[140px]">
                <ScoreInput id={assessment.id} totalMarks={assessment.totalMarks ?? 100} />
              </div>
            )}

            {hasSubtasks ? (
              <Button className="z-10" plain onClick={() => setOpen((prev) => !prev)}>
                {assessment.subtasks?.length} Tasks
                <ChevronIcon open={open} />
              </Button>
            ) : null}
          </div>
        </div>
      </div>
      {hasSubtasks && open ? (
        <div className="border-t border-zinc-950/10 dark:border-white/10">
          <div className="divide-y divide-zinc-950/10 dark:divide-white/10 divide-dashed">
            {assessment.subtasks?.map((subtask) => (
              <SubtaskRow key={subtask.id} subtask={subtask} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
