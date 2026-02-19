import type { AssessmentConfig, ModuleConfig, PassRule } from "./efy-config";
import { efyModules } from "./efy-config";

export type GradeMap = Record<string, number | null | undefined>;

export type StatusTone = "good" | "warn" | "bad" | "nodata";

export type OutstandingRequirement = {
  moduleId: string;
  moduleName: string;
  assessmentId: string;
  assessmentName: string;
  taskId: string;
  taskName: string | null;
  totalMarks: number;
  requiredPercent: number | null;
  requiredMarks: number | null;
  possible: boolean;
  reason?: string;
};

export const statusMeta: Record<
  StatusTone,
  { label: string; badgeColor: "green" | "orange" | "red" | "zinc" }
> = {
  good: { label: "On track", badgeColor: "green" },
  warn: { label: "Close to pass", badgeColor: "orange" },
  bad: { label: "On track to fail", badgeColor: "red" },
  nodata: { label: "No data", badgeColor: "zinc" },
};

const MATH_A_ID = "maths-a-test";
const MATH_B_ID = "maths-b-test";

function hasValue(value: number | null | undefined): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

function toPercent(score: number, total: number) {
  if (total <= 0) return null;
  return (score / total) * 100;
}

export function computeAssessmentPercent(
  assessment: AssessmentConfig,
  grades: GradeMap,
): number | null {
  if (assessment.subtasks && assessment.subtasks.length > 0) {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const subtask of assessment.subtasks) {
      const value = grades[subtask.id];
      if (!hasValue(value)) continue;
      const percent = toPercent(value, subtask.totalMarks);
      if (percent === null) continue;
      weightedSum += percent * subtask.weight;
      totalWeight += subtask.weight;
    }

    if (totalWeight === 0) return null;
    return weightedSum / totalWeight;
  }

  const value = grades[assessment.id];
  if (!hasValue(value)) return null;
  const totalMarks = assessment.totalMarks ?? 100;
  return toPercent(value, totalMarks);
}

function computeAssessmentContribution(assessment: AssessmentConfig, grades: GradeMap) {
  if (assessment.subtasks && assessment.subtasks.length > 0) {
    let weightedSum = 0;
    let totalWeight = 0;
    for (const subtask of assessment.subtasks) {
      const value = grades[subtask.id];
      if (!hasValue(value)) continue;
      const percent = toPercent(value, subtask.totalMarks);
      if (percent === null) continue;
      weightedSum += percent * subtask.weight;
      totalWeight += subtask.weight;
    }
    return { weightedSum, totalWeight };
  }

  const value = grades[assessment.id];
  if (!hasValue(value)) return { weightedSum: 0, totalWeight: 0 };
  const totalMarks = assessment.totalMarks ?? 100;
  const percent = toPercent(value, totalMarks);
  if (percent === null) return { weightedSum: 0, totalWeight: 0 };

  return { weightedSum: percent * (assessment.weight ?? 0), totalWeight: assessment.weight ?? 0 };
}

export function computeModulePercent(module: ModuleConfig, grades: GradeMap): number | null {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const assessment of module.assessments) {
    const contribution = computeAssessmentContribution(assessment, grades);
    weightedSum += contribution.weightedSum;
    totalWeight += contribution.totalWeight;
  }

  if (totalWeight === 0) return null;
  return weightedSum / totalWeight;
}

export function computeMathStats(grades: GradeMap) {
  const mathsA = hasValue(grades[MATH_A_ID]) ? (grades[MATH_A_ID] as number) : null;
  const mathsB = hasValue(grades[MATH_B_ID]) ? (grades[MATH_B_ID] as number) : null;

  const available = [mathsA, mathsB].filter((value): value is number => value !== null);
  const average =
    available.length > 0
      ? available.reduce((sum, value) => sum + value, 0) / available.length
      : null;

  return { mathsA, mathsB, average };
}

function moduleHasAnyGrade(module: ModuleConfig, grades: GradeMap) {
  for (const assessment of module.assessments) {
    if (assessment.subtasks && assessment.subtasks.length > 0) {
      for (const subtask of assessment.subtasks) {
        if (hasValue(grades[subtask.id])) return true;
      }
      continue;
    }
    if (hasValue(grades[assessment.id])) return true;
  }
  return false;
}

export function getModuleStatus(module: ModuleConfig, grades: GradeMap): StatusTone {
  if (!moduleHasAnyGrade(module, grades)) return "nodata";

  const percent = computeModulePercent(module, grades);

  if (module.passRule.type === "maths") {
    const { mathsA, mathsB, average } = computeMathStats(grades);

    if (mathsA !== null && mathsB !== null) {
      if (average === null) return "bad";
      if (average < module.passRule.averageThreshold) return "bad";
      if (mathsB < module.passRule.mathsBThreshold) return "bad";
      return "good";
    }

    if (mathsA !== null) {
      const requiredMathsB = Math.max(
        module.passRule.mathsBThreshold,
        module.passRule.averageThreshold * 2 - mathsA,
      );
      return requiredMathsB <= 100 ? "good" : "bad";
    }

    if (mathsB !== null) {
      if (mathsB < module.passRule.mathsBThreshold) return "bad";
      const requiredMathsA = module.passRule.averageThreshold * 2 - mathsB;
      return requiredMathsA <= 100 ? "good" : "bad";
    }

    return "nodata";
  }

  if (percent === null) return "warn";

  if (percent < module.passRule.threshold) return "bad";
  if (percent < module.passRule.threshold + 5) return "warn";
  return "good";
}

export function formatPercent(value: number | null, fallback = "—") {
  if (value === null || Number.isNaN(value)) return fallback;
  return `${value.toFixed(1)}%`;
}

export function getOverallStatus(modules: ModuleConfig[], grades: GradeMap) {
  let hasWarn = false;
  let hasNoData = false;
  let hasGood = false;

  for (const mod of modules) {
    const status = getModuleStatus(mod, grades);
    if (status === "bad") return "bad";
    if (status === "warn") hasWarn = true;
    if (status === "nodata") hasNoData = true;
    if (status === "good") hasGood = true;
  }

  if (hasWarn) return "warn";
  if (hasGood) return "good";
  if (hasNoData) return "nodata";
  return "good";
}

export function computeOverallPercent(modules: ModuleConfig[], grades: GradeMap) {
  const percents = modules
    .map((module) => computeModulePercent(module, grades))
    .filter((value): value is number => value !== null);

  if (percents.length === 0) return null;

  const total = percents.reduce((sum, value) => sum + value, 0);
  return total / percents.length;
}

export function getAllAssessmentIds() {
  const ids: string[] = [];

  for (const mod of efyModules) {
    for (const assessment of mod.assessments) {
      if (assessment.subtasks && assessment.subtasks.length > 0) {
        ids.push(...assessment.subtasks.map((task) => task.id));
      } else {
        ids.push(assessment.id);
      }
    }
  }
  return ids;
}

type ModuleTask = {
  id: string;
  name: string | null;
  assessmentId: string;
  assessmentName: string;
  weight: number;
  totalMarks: number;
};

type RequirementResult = {
  requiredPercent: number | null;
  requiredMarks: number | null;
  possible: boolean;
  reason?: string;
};

function getModuleTasks(module: ModuleConfig): ModuleTask[] {
  const tasks: ModuleTask[] = [];

  for (const assessment of module.assessments) {
    if (assessment.subtasks && assessment.subtasks.length > 0) {
      for (const subtask of assessment.subtasks) {
        tasks.push({
          id: subtask.id,
          name: subtask.name,
          assessmentId: assessment.id,
          assessmentName: assessment.name,
          weight: subtask.weight,
          totalMarks: subtask.totalMarks,
        });
      }
    } else {
      tasks.push({
        id: assessment.id,
        name: null,
        assessmentId: assessment.id,
        assessmentName: assessment.name,
        weight: assessment.weight ?? 0,
        totalMarks: assessment.totalMarks ?? 100,
      });
    }
  }

  return tasks;
}

function getTaskPercent(task: ModuleTask, grades: GradeMap) {
  const value = grades[task.id];
  if (!hasValue(value)) return null;
  return toPercent(value, task.totalMarks);
}

function getThresholdRequirement(
  threshold: number,
  tasks: ModuleTask[],
  grades: GradeMap,
): RequirementResult {
  let totalWeight = 0;
  let knownSum = 0;
  let missingWeight = 0;

  for (const task of tasks) {
    totalWeight += task.weight;
    const percent = getTaskPercent(task, grades);
    if (percent === null) {
      missingWeight += task.weight;
      continue;
    }
    knownSum += percent * task.weight;
  }

  if (totalWeight <= 0) {
    return {
      requiredPercent: null,
      requiredMarks: null,
      possible: false,
      reason: "No weighting available",
    };
  }

  if (missingWeight <= 0) {
    return { requiredPercent: 0, requiredMarks: 0, possible: true };
  }

  const requiredRaw = (threshold * totalWeight - knownSum) / missingWeight;

  if (!Number.isFinite(requiredRaw)) {
    return {
      requiredPercent: null,
      requiredMarks: null,
      possible: false,
      reason: "Unable to calculate",
    };
  }

  if (requiredRaw > 100) {
    return {
      requiredPercent: requiredRaw,
      requiredMarks: null,
      possible: false,
      reason: "Needs above 100%",
    };
  }

  const requiredPercent = Math.max(0, requiredRaw);
  return {
    requiredPercent,
    requiredMarks: null,
    possible: true,
  };
}

function getMathRequirement(
  taskId: string,
  grades: GradeMap,
  passRule: Extract<PassRule, { type: "maths" }>,
  totals: Record<string, number>,
): RequirementResult {
  const totalA = totals[MATH_A_ID] ?? 100;
  const totalB = totals[MATH_B_ID] ?? 100;
  const mathsA = hasValue(grades[MATH_A_ID])
    ? toPercent(grades[MATH_A_ID] as number, totalA)
    : null;
  const mathsB = hasValue(grades[MATH_B_ID])
    ? toPercent(grades[MATH_B_ID] as number, totalB)
    : null;
  const missingA = mathsA === null;
  const missingB = mathsB === null;

  if (missingA && missingB) {
    const requiredPercent = Math.max(passRule.averageThreshold, passRule.mathsBThreshold);
    if (requiredPercent > 100) {
      return { requiredPercent, requiredMarks: null, possible: false, reason: "Needs above 100%" };
    }
    return {
      requiredPercent,
      requiredMarks: (requiredPercent / 100) * (taskId === MATH_B_ID ? totalB : totalA),
      possible: true,
    };
  }

  if (taskId === MATH_A_ID) {
    if (mathsB === null) {
      return {
        requiredPercent: null,
        requiredMarks: null,
        possible: false,
        reason: "Maths B missing",
      };
    }
    if (mathsB < passRule.mathsBThreshold) {
      return {
        requiredPercent: null,
        requiredMarks: null,
        possible: false,
        reason: "Maths B below 60%",
      };
    }
    const requiredRaw = passRule.averageThreshold * 2 - mathsB;
    if (requiredRaw > 100) {
      return {
        requiredPercent: requiredRaw,
        requiredMarks: null,
        possible: false,
        reason: "Needs above 100%",
      };
    }
    const requiredPercent = Math.max(0, requiredRaw);
    return {
      requiredPercent,
      requiredMarks: (requiredPercent / 100) * totalA,
      possible: true,
    };
  }

  if (taskId === MATH_B_ID) {
    if (mathsA === null) {
      return {
        requiredPercent: null,
        requiredMarks: null,
        possible: false,
        reason: "Maths A missing",
      };
    }
    const requiredRaw = Math.max(passRule.mathsBThreshold, passRule.averageThreshold * 2 - mathsA);
    if (requiredRaw > 100) {
      return {
        requiredPercent: requiredRaw,
        requiredMarks: null,
        possible: false,
        reason: "Needs above 100%",
      };
    }
    const requiredPercent = Math.max(0, requiredRaw);
    return {
      requiredPercent,
      requiredMarks: (requiredPercent / 100) * totalB,
      possible: true,
    };
  }

  return {
    requiredPercent: null,
    requiredMarks: null,
    possible: false,
    reason: "Unsupported maths task",
  };
}

export function getOutstandingRequirements(
  modules: ModuleConfig[],
  grades: GradeMap,
): OutstandingRequirement[] {
  const outstanding: OutstandingRequirement[] = [];
  const mathTotals: Record<string, number> = {};

  for (const mod of modules) {
    for (const task of getModuleTasks(mod)) {
      if (task.id === MATH_A_ID || task.id === MATH_B_ID) {
        mathTotals[task.id] = task.totalMarks;
      }
    }
  }


  for (const mod of modules) {
    const tasks = getModuleTasks(mod);
    const missingTasks = tasks.filter((task) => getTaskPercent(task, grades) === null);
    if (missingTasks.length === 0) continue;

    if (mod.passRule.type === "maths") {
      for (const task of missingTasks) {
        const result = getMathRequirement(task.id, grades, mod.passRule, mathTotals);

        outstanding.push({
          moduleId: mod.id,
          moduleName: mod.name,
          assessmentId: task.assessmentId,
          assessmentName: task.assessmentName,
          taskId: task.id,
          taskName: task.name,
          totalMarks: task.totalMarks,
          requiredPercent: result.requiredPercent,
          requiredMarks: result.requiredMarks,
          possible: result.possible,
          reason: result.reason,
        });
      }
      continue;
    }


    const moduleRequirement = getThresholdRequirement(mod.passRule.threshold, tasks, grades);

    for (const task of missingTasks) {
      const requiredPercent = moduleRequirement.requiredPercent;
      const requiredMarks =
        moduleRequirement.possible && requiredPercent !== null
          ? (requiredPercent / 100) * task.totalMarks
          : null;

      outstanding.push({
        moduleId: mod.id,
        moduleName: mod.name,
        assessmentId: task.assessmentId,
        assessmentName: task.assessmentName,
        taskId: task.id,
        taskName: task.name,
        totalMarks: task.totalMarks,
        requiredPercent,
        requiredMarks,
        possible: moduleRequirement.possible,
        reason: moduleRequirement.reason,
      });
    }
  }

  return outstanding;
}
