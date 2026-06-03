export type CodeLanguage =
  | "typescript"
  | "javascript"
  | "sql"
  | "unknown";

export type ReviewSeverity = "critical" | "warning" | "suggestion" | "praise";

export type VibeCodeAction =
  | "review"
  | "generate_tests"
  | "explain"
  | "refactor"
  | "optimize";

export interface ReviewIssue {
  severity: ReviewSeverity;
  category: ReviewCategory;
  line?: number;
  title: string;
  description: string;
  suggestion: string;
}

export type ReviewCategory =
  | "bug"
  | "security"
  | "performance"
  | "best_practice"
  | "readability"
  | "type_safety"
  | "error_handling"
  | "architecture";

export interface CodeReviewResult {
  language: CodeLanguage;
  overall_score: number;
  summary: string;
  issues: ReviewIssue[];
  refactored_code?: string;
  metrics: {
    complexity: "low" | "medium" | "high";
    maintainability: number;
    test_coverage_suggestion: number;
  };
}

export interface TestCase {
  name: string;
  description: string;
  type: "unit" | "integration" | "edge_case" | "error_case";
  code: string;
  mocks?: string[];
}

export interface TestGenerationResult {
  language: CodeLanguage;
  framework: "vitest" | "jest" | "mocha" | "pytest";
  test_file_name: string;
  imports: string[];
  test_cases: TestCase[];
  full_test_code: string;
  coverage_areas: string[];
}

export interface CodeExplanation {
  summary: string;
  language: CodeLanguage;
  breakdown: Array<{
    part: string;
    explanation: string;
  }>;
  complexity: {
    time?: string;
    space?: string;
    overall: "low" | "medium" | "high";
  };
  potential_issues: string[];
  learning_points: string[];
}

export interface VibeCodeState {
  action?: VibeCodeAction;
  pending_code?: string;
  language?: CodeLanguage;
  awaiting_code: boolean;
  last_review_result?: CodeReviewResult;
  last_test_result?: TestGenerationResult;
}