export type PassRule =
  | { type: "threshold"; threshold: number; label: string }
  | { type: "maths"; averageThreshold: number; mathsBThreshold: number; label: string };

export type SubtaskConfig = {
  id: string;
  name: string;
  weight: number;
  totalMarks: number;
};

export type AssessmentConfig = {
  id: string;
  name: string;
  weight?: number;
  totalMarks?: number;
  subtasks?: SubtaskConfig[];
};

export type ModuleConfig = {
  id: string;
  name: string;
  passRule: PassRule;
  assessments: AssessmentConfig[];
};

export const efyModules: ModuleConfig[] = [
  {
    id: "maths-a",
    name: "Mathematics A",
    passRule: {
      type: "maths",
      averageThreshold: 55,
      mathsBThreshold: 60,
      label: "Average of Maths A + B ≥ 55% and Maths B ≥ 60%",
    },
    assessments: [
      {
        id: "maths-a-test",
        name: "Mathematics A Test",
        weight: 100,
        totalMarks: 100,
      },
    ],
  },
  {
    id: "maths-b",
    name: "Mathematics B",
    passRule: {
      type: "maths",
      averageThreshold: 55,
      mathsBThreshold: 60,
      label: "Average of Maths A + B ≥ 55% and Maths B ≥ 60%",
    },
    assessments: [
      {
        id: "maths-b-test",
        name: "Mathematics B Test",
        weight: 100,
        totalMarks: 100,
      },
    ],
  },
  {
    id: "mechanical-science",
    name: "Mechanical Science",
    passRule: { type: "threshold", threshold: 45, label: "Pass mark ≥ 45%" },
    assessments: [
      {
        id: "mechanical-science-test",
        name: "Mechanical Science Test",
        weight: 100,
        totalMarks: 100,
      },
    ],
  },
  {
    id: "electricity-electronics",
    name: "Electricity and Electronics",
    passRule: { type: "threshold", threshold: 45, label: "Pass mark ≥ 45%" },
    assessments: [
      {
        id: "electricity-electronics-test",
        name: "Electricity and Electronics Test",
        weight: 100,
        totalMarks: 100,
      },
    ],
  },
  {
    id: "engineering-principles",
    name: "Engineering Principles",
    passRule: { type: "threshold", threshold: 45, label: "Pass mark ≥ 45%" },
    assessments: [
      {
        id: "engineering-principles-test",
        name: "Engineering Principles Test",
        weight: 100,
        totalMarks: 100,
      },
    ],
  },
  {
    id: "routes-to-success",
    name: "Routes to Success",
    passRule: { type: "threshold", threshold: 60, label: "Pass mark ≥ 60%" },
    assessments: [
      {
        id: "rts-a1-quiz",
        name: "A.1 Quiz",
        weight: 10,
        totalMarks: 10,
      },
      {
        id: "rts-a2-data-analysis",
        name: "A.2 Data Analysis",
        weight: 20,
        totalMarks: 100,
      },
      {
        id: "rts-b1-writing-portfolio",
        name: "B.1 Writing Portfolio",
        subtasks: [
          { id: "rts-b1-task-1", name: "Task 1", weight: 1.2, totalMarks: 100 },
          { id: "rts-b1-task-2", name: "Task 2", weight: 1.2, totalMarks: 100 },
          { id: "rts-b1-task-3", name: "Task 3", weight: 1.2, totalMarks: 100 },
          { id: "rts-b1-task-4", name: "Task 4", weight: 1.2, totalMarks: 100 },
          { id: "rts-b1-task-5", name: "Task 5", weight: 1.2, totalMarks: 100 },
          {
            id: "rts-b1-technical-report",
            name: "Technical Report (& Self-Evaluation)",
            weight: 24,
            totalMarks: 100,
          },
        ],
      },
      {
        id: "rts-c1-group-paper-poster",
        name: "C.1 EWB Group Paper & Poster",
        weight: 30,
        totalMarks: 100,
      },
      {
        id: "rts-c2-meeting-feedback",
        name: "C.2 EWB Meeting & Peer Feedback",
        weight: 5,
        totalMarks: 100,
      },
      {
        id: "rts-c3-poster-pitch",
        name: "C.3 EWB Poster Pitch",
        weight: 5,
        totalMarks: 100,
      },
    ],
  },
  {
    id: "coursework",
    name: "Coursework",
    passRule: { type: "threshold", threshold: 60, label: "Pass mark ≥ 60%" },
    assessments: [
      {
        id: "coursework-comp-apps-1",
        name: "Comp Apps 1 - Poster",
        weight: 8,
        totalMarks: 20,
      },
      {
        id: "coursework-physics-labs",
        name: "Physics Labs",
        subtasks: [
          { id: "coursework-physics-ee1", name: "EE1", weight: 2, totalMarks: 12 },
          { id: "coursework-physics-ms1", name: "MS1", weight: 2.4, totalMarks: 12 },
          { id: "coursework-physics-ms2", name: "MS2", weight: 2.4, totalMarks: 12 },
          { id: "coursework-physics-ms3", name: "MS3", weight: 2.4, totalMarks: 12 },
          { id: "coursework-physics-ms4", name: "MS4", weight: 2.4, totalMarks: 12 },
          { id: "coursework-physics-ms5", name: "MS5", weight: 2.4, totalMarks: 12 },
          { id: "coursework-physics-ep1", name: "EP1", weight: 2.4, totalMarks: 12 },
          { id: "coursework-physics-ep2", name: "EP2", weight: 2.4, totalMarks: 12 },
          { id: "coursework-physics-ep3", name: "EP3", weight: 2.4, totalMarks: 12 },
          { id: "coursework-physics-ep4", name: "EP4", weight: 2.4, totalMarks: 12 },
          { id: "coursework-physics-ep5", name: "EP5", weight: 2.4, totalMarks: 12 },
        ],
      },
      {
        id: "coursework-electronics-pbl",
        name: "Electronics PBL",
        weight: 10,
        totalMarks: 100,
      },
      {
        id: "coursework-formal-report-1",
        name: "Formal Report 1",
        weight: 12,
        totalMarks: 100,
      },
      {
        id: "coursework-python-tests",
        name: "Python Tests",
        subtasks: [
          { id: "coursework-python-test-1", name: "Test 1", weight: 4, totalMarks: 10 },
          { id: "coursework-python-test-2", name: "Test 2", weight: 4, totalMarks: 15 },
          { id: "coursework-python-test-3", name: "Test 3", weight: 4, totalMarks: 15 },
        ],
      },
      {
        id: "coursework-comp-apps-3",
        name: "Comp Apps 3",
        subtasks: [
          { id: "coursework-comp-apps-3-inc-1", name: "Increment 1", weight: 4, totalMarks: 100 },
          { id: "coursework-comp-apps-3-inc-2", name: "Increment 2", weight: 4, totalMarks: 100 },
          { id: "coursework-comp-apps-3-inc-3", name: "Increment 3", weight: 4, totalMarks: 100 },
          { id: "coursework-comp-apps-3-inc-4", name: "Increment 4", weight: 4, totalMarks: 100 },
        ],
      },
      {
        id: "coursework-formal-report-2",
        name: "Formal Report 2",
        weight: 12,
        totalMarks: 100,
      },
    ],
  },
];

export const moduleById = Object.fromEntries(efyModules.map((module) => [module.id, module]));
