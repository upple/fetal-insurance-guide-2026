/**
 * Automated Integrity Verification Script for fetal-insurance-guide-2026 (v2.2)
 * 
 * Verifies consistency across:
 * 1. Product version (Hi2607)
 * 2. Newborn disease hospitalization rider (1-120일, 1일차 첫날부터 보장)
 * 3. 5th-gen indemnity health insurance structure (급여 / 특약1 중증비급여 30% / 특약2 비중증비급여 50%)
 * 4. Premium flows and mathematical precision (42,560원 -> 61,870원)
 * 5. Sample terminology (온라인 실가입 및 사전견적 분석 표본 N=350)
 * 6. Legal & underwriting standards (상법 제651조의2, 제655조 단서)
 * 7. Hi2607 July 2026 New Riders (50-1, 52-1, 85-1) in Matrix
 * 8. Cardinality Definition & Data Model
 * 9. Elimination of Deterministic & Hyperbolic Phrasing
 * 10. Audit Quality Review (A- Rating & Failure Conditions Checklist)
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const rootDir = process.cwd();

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
}

const results: TestResult[] = [];

function check(suite: string, name: string, condition: boolean, message?: string) {
  results.push({ suite, name, passed: condition, message });
}

function readFile(relPath: string): string {
  const fullPath = join(rootDir, relPath);
  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return readFileSync(fullPath, "utf-8");
}

console.log("============================================================");
console.log("🚀 Starting fetal-insurance-guide-2026 Automated Integrity Test (v2.2)");
console.log("============================================================\n");

// ------------------------------------------------------------
// Suite 1: Product Version (Hi2607)
// ------------------------------------------------------------
const suite1 = "Suite 1: Product Version (Hi2607)";
const targetFiles = [
  "README.md",
  "full_rider_selection_matrix.md",
  "standard_50k_30yr_quote.md",
  "optimal_design/optimal_prenatal_quote_final.md",
  "underwriting_scenarios.md",
  "version_history_hi2607.md",
  "audit_quality_review.md"
];

for (const file of targetFiles) {
  const content = readFile(file);
  check(suite1, `${file} references Hi2607 as current product`, content.includes("Hi2607"));
}

const matrixContent = readFile("full_rider_selection_matrix.md");
check(
  suite1,
  "full_rider_selection_matrix.md does not claim Hi2605 as latest",
  !matrixContent.includes("Hi2605 / 2026년 최신판")
);

// ------------------------------------------------------------
// Suite 2: Newborn Disease Hospitalization (신생아질병입원일당)
// ------------------------------------------------------------
const suite2 = "Suite 2: Newborn Disease Hospitalization (1-120일)";
const quoteContent = readFile("standard_50k_30yr_quote.md");
const finalContent = readFile("optimal_design/optimal_prenatal_quote_final.md");

check(
  suite2,
  "standard_50k_30yr_quote.md specifies 1-120일 and day 1 payout",
  quoteContent.includes("신생아 질병입원일당 (1-120일)") && quoteContent.includes("첫날부터 매일 지급")
);

check(
  suite2,
  "standard_50k_30yr_quote.md does not describe 신생아질병입원 as 4일초과",
  !quoteContent.includes("신생아 질병입원일당 (4일초과")
);

check(
  suite2,
  "full_rider_selection_matrix.md specifies 1-120일 and day 1 payout",
  matrixContent.includes("신생아 질병입원일당 (1-120일)") && matrixContent.includes("첫날부터 매일 지급")
);

check(
  suite2,
  "optimal_prenatal_quote_final.md specifies 1-120일 and day 1 payout",
  finalContent.includes("신생아질병입원일당(1-120일)") && finalContent.includes("첫날부터 매일 1만원 지급")
);

// ------------------------------------------------------------
// Suite 3: 5th Generation Indemnity Insurance Structure
// ------------------------------------------------------------
const suite3 = "Suite 3: 5th Gen Indemnity Insurance Structure";
const indemnityContent = readFile("raw_sources/05_indemnity_health_insurance_5th_gen_2026.md");

check(
  suite3,
  "5th gen doc defines 급여 (기본계약)",
  indemnityContent.includes("1. 급여 (기본계약)")
);

check(
  suite3,
  "5th gen doc defines 중증 비급여 (특약 1) with 30% copay",
  indemnityContent.includes("중증 비급여 (특약 1)") && indemnityContent.includes("30%")
);

check(
  suite3,
  "5th gen doc defines 비중증 비급여 (특약 2) with 50% copay and 1,000만 cap",
  indemnityContent.includes("비중증 비급여 (특약 2)") && indemnityContent.includes("50%") && indemnityContent.includes("1,000만 원")
);

check(
  suite3,
  "5th gen doc clearly explains exclusion of manual therapy in 특약 2",
  indemnityContent.includes("도수치료·증식치료·체외충격파") && indemnityContent.includes("원칙적으로 제외")
);

check(
  suite3,
  "5th gen doc clarifies that old 3대 비급여 limits are not standalone in 5th gen",
  indemnityContent.includes("3대 비급여 특약")
);

// ------------------------------------------------------------
// Suite 4: Premium Calculations & Mathematical Consistency
// ------------------------------------------------------------
const suite4 = "Suite 4: Premium Calculations & Math";
const marketContent = readFile("market_premium_tiers_2026.md");

const expectedPremiums = [
  { label: "Prenatal Hyundai", val: "24,770원" },
  { label: "Prenatal Indemnity", val: "17,790원" },
  { label: "Prenatal Total", val: "42,560원" },
  { label: "Postnatal 0yo Hyundai", val: "34,870원" },
  { label: "Postnatal 0yo Indemnity", val: "27,000원" },
  { label: "Postnatal 0yo Total", val: "61,870원" }
];

for (const p of expectedPremiums) {
  check(
    suite4,
    `standard_50k_30yr_quote.md matches ${p.label} (${p.val})`,
    quoteContent.includes(p.val)
  );
  check(
    suite4,
    `market_premium_tiers_2026.md matches ${p.label} (${p.val})`,
    marketContent.includes(p.val)
  );
  check(
    suite4,
    `optimal_prenatal_quote_final.md matches ${p.label} (${p.val})`,
    finalContent.includes(p.val)
  );
}

// ------------------------------------------------------------
// Suite 5: Sample Terminology & Descriptive Consistency
// ------------------------------------------------------------
const suite5 = "Suite 5: Sample Terminology (N=350)";

check(
  suite5,
  "market_premium_tiers_2026.md uses unified sample phrasing",
  marketContent.includes("온라인 실가입 및 사전견적 분석 표본") && marketContent.includes("N = 350")
);

check(
  suite5,
  "standard_50k_30yr_quote.md uses unified sample phrasing",
  quoteContent.includes("온라인 실가입 및 사전견적 분석 표본(N=350)")
);

check(
  suite5,
  "README.md uses unified sample phrasing",
  readFile("README.md").includes("온라인 실가입 및 사전견적 표본(N=350)")
);

// ------------------------------------------------------------
// Suite 6: Underwriting Scenarios & Commercial Act Precision
// ------------------------------------------------------------
const suite6 = "Suite 6: Underwriting & Commercial Act Legal Precision";
const underContent = readFile("underwriting_scenarios.md");

check(
  suite6,
  "underwriting_scenarios.md references 상법 제651조의2 (서면에 의한 질문의 효력)",
  underContent.includes("상법 제651조의2")
);

check(
  suite6,
  "underwriting_scenarios.md references 상법 제655조 단서 (인과관계 부존재 책임)",
  underContent.includes("상법 제655조 단서")
);

check(
  suite6,
  "underwriting_scenarios.md contains Scenario E (복합 사례: 정신과 약물 중단 + 응급실)",
  underContent.includes("Scenario E") && underContent.includes("정신건강의학과") && underContent.includes("응급실")
);

check(
  suite6,
  "underwriting_scenarios.md contains maternal underwriting decoupling banner",
  underContent.includes("표준 권장 견적과 실제 가입자의 개별 인수심사 분리 안내")
);

// ------------------------------------------------------------
// Suite 7: Hi2607 July 2026 New Riders in Matrix
// ------------------------------------------------------------
const suite7 = "Suite 7: Hi2607 July 2026 New Riders";

check(
  suite7,
  "full_rider_selection_matrix.md includes 50-1 (특정요로감염 및 신생아요로감염 진단비)",
  matrixContent.includes("50-1") && matrixContent.includes("특정요로감염 및 신생아요로감염")
);

check(
  suite7,
  "full_rider_selection_matrix.md includes 52-1 (종합병원 아토피 표적치료)",
  matrixContent.includes("52-1") && matrixContent.includes("종합병원 아토피 표적치료")
);

check(
  suite7,
  "full_rider_selection_matrix.md includes 85-1 (안과질환 통합보장 및 특정처치·수술비)",
  matrixContent.includes("85-1") && matrixContent.includes("안과질환 통합보장 및 특정처치·수술비")
);

// ------------------------------------------------------------
// Suite 8: Cardinality Definition & Data Model
// ------------------------------------------------------------
const suite8 = "Suite 8: Cardinality Definition & Data Model";

check(
  suite8,
  "full_rider_selection_matrix.md defines 130 slots vs 126 individual riders",
  matrixContent.includes("총 130번 슬롯 체계") && matrixContent.includes("총 126개")
);

check(
  suite8,
  "full_rider_selection_matrix.md documents legacy gap slots",
  matrixContent.includes("56~60") && matrixContent.includes("74~75") && matrixContent.includes("86~95")
);

// ------------------------------------------------------------
// Suite 9: Elimination of Deterministic & Hyperbolic Phrasing
// ------------------------------------------------------------
const suite9 = "Suite 9: Elimination of Deterministic & Hyperbolic Phrasing";

const filesToCheckHyperbole = [
  "underwriting_scenarios.md",
  "full_rider_selection_matrix.md",
  "standard_50k_30yr_quote.md",
  "audit_quality_review.md",
  "README.md"
];

for (const file of filesToCheckHyperbole) {
  const c = readFile(file);
  check(suite9, `${file} does not contain '100% 무심사'`, !c.includes("100% 무심사"));
  check(suite9, `${file} does not contain '100% 적발'`, !c.includes("100% 적발"));
  check(suite9, `${file} does not contain '100% 방어'`, !c.includes("100% 방어"));
}

check(
  suite9,
  "audit_quality_review.md does not contain unconditional '추가 수정 없이 가입 무방'",
  !readFile("audit_quality_review.md").includes("추가적인 수정 없이 이 설계서 조건 그대로 보험 설계사에게 견적을 의뢰하여 가입을 진행하셔도 무방합니다")
);

// ------------------------------------------------------------
// Suite 10: Audit Quality Review (A- Rating & Failure Conditions)
// ------------------------------------------------------------
const suite10 = "Suite 10: Audit Quality Review (A- & Failure Conditions)";
const auditContent = readFile("audit_quality_review.md");

check(
  suite10,
  "audit_quality_review.md has rating A-",
  auditContent.includes("**최종 품질 등급:** **A-")
);

check(
  suite10,
  "audit_quality_review.md defines 3 Audit Failure Conditions",
  auditContent.includes("감사 부적합/불일치 판정 조건 (Audit Failure Conditions)") &&
  auditContent.includes("산모 병력·검사 이력 보유 시") &&
  auditContent.includes("30세 만기 계약전환 시점의 미래 위험률 변동") &&
  auditContent.includes("5세대 실손의 비급여 보장 축소 한계")
);

// ------------------------------------------------------------
// Summary Report
// ------------------------------------------------------------
console.log("------------------------------------------------------------");
let allPassed = true;
let passCount = 0;
let failCount = 0;

for (const r of results) {
  if (r.passed) {
    passCount++;
    console.log(`✅ [PASS] [${r.suite}] ${r.name}`);
  } else {
    failCount++;
    allPassed = false;
    console.log(`❌ [FAIL] [${r.suite}] ${r.name} - ${r.message || "Condition failed"}`);
  }
}

console.log("------------------------------------------------------------");
console.log(`Total Checks: ${results.length} | Passed: ${passCount} | Failed: ${failCount}`);

if (!allPassed) {
  console.error("\n❌ Integrity Verification Failed! Please fix the errors above.");
  process.exit(1);
} else {
  console.log("\n✨ All integrity checks passed successfully (100% verified)!");
  process.exit(0);
}
