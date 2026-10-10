/**
 * Automated Integrity Verification Script for fetal-insurance-guide-2026 (v2.5)
 * 
 * Verifies consistency across:
 * 1. Product version (Hi2607 across all files & unified v2.5 metadata)
 * 2. Newborn & Low Birth Weight conditions (신생아질병 1-120일 첫날부터 & 저체중아 2.5kg이하/3일이상/3일째부터)
 * 3. 5th-gen indemnity health insurance structure (급여 / 특약1 중증비급여 5천만 한도·상급종병 500만상한 / 특약2 비중증 1천만 한도·50%)
 * 4. Premium flows and mathematical precision (42,560원 -> 61,870원)
 * 5. Sample terminology & anonymized dataset integrity (N=350, 62%/26%/8%/4% breakdown)
 * 6. Legal & underwriting standards (상법 제651조의2, 제655조 단서, Scenario E 성실 고지)
 * 7. Hi2607 July 2026 New Riders (50-1, 52-1, 85-1) in Matrix
 * 8. Dynamic Cardinality Parsing & Verification (124 unique rows, 0 duplicate IDs, 18 gaps, 7 groups)
 * 9. Elimination of Deterministic, Avoidance & Hyperbolic Phrasing
 * 10. Audit Quality Review (A- Rating & Failure Conditions Checklist)
 * 11. Source Citation Coverage (official pages named in reader-facing docs)
 * 12. 100% Clickable Verification for All Amounts (Zero Guessing Policy & 1:1 Links)
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
console.log("🚀 Starting fetal-insurance-guide-2026 Automated Integrity Test (v2.5)");
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

const quoteContent = readFile("standard_50k_30yr_quote.md");
const finalContent = readFile("optimal_design/optimal_prenatal_quote_final.md");
const auditContent = readFile("audit_quality_review.md");

check(suite1, "standard_50k_30yr_quote.md has unified v2.5 metadata", quoteContent.includes("v2.5"));
check(suite1, "optimal_prenatal_quote_final.md has unified v2.5 metadata", finalContent.includes("v2.5"));
check(suite1, "audit_quality_review.md has unified v2.5 metadata", auditContent.includes("v2.5"));
check(suite1, "full_rider_selection_matrix.md specifies Group 3 has 13종", matrixContent.includes("제3군: 질병 입원일당 담보 (13종)"));

// ------------------------------------------------------------
// Suite 2: Newborn & Low Birth Weight Conditions (신생아질병 및 저체중아입원)
// ------------------------------------------------------------
const suite2 = "Suite 2: Newborn & Low Birth Weight Hospitalization Conditions";

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

// 저체중아입원일당: 2.5kg 이하 / 3일 이상 / 3일째부터 지급 checks
check(
  suite2,
  "standard_50k_30yr_quote.md 저체중아입원 condition is 2.5kg 이하 / 3일째부터",
  quoteContent.includes("2.5kg 이하") && quoteContent.includes("3일째부터")
);

check(
  suite2,
  "optimal_prenatal_quote_final.md 저체중아입원 condition is 2.5kg 이하 / 3일째부터",
  finalContent.includes("2.5kg 이하") && finalContent.includes("3일째부터")
);

check(
  suite2,
  "full_rider_selection_matrix.md 저체중아입원 condition is 2.5kg 이하 / 3일째부터",
  matrixContent.includes("2.5kg 이하") && matrixContent.includes("3일째부터")
);

const policyContent = readFile("raw_sources/02_hyundai_good_and_good_policy_2026.md");
check(
  suite2,
  "02_hyundai_good_and_good_policy_2026.md 저체중아입원 condition is 2.5kg 이하 / 3일째부터",
  policyContent.includes("2.5kg 이하") && policyContent.includes("3일째부터")
);

// Verify that outdated "4일째" and "2.5kg 미만" are strictly zero across all active policy/guide files
const activeGuideFiles = [
  ...targetFiles.filter(f => f !== "version_history_hi2607.md"),
  "direct_quote_simulation_guide.md",
  "quotes/quote_comparison_3_insurers.md",
  "quotes/quote_30year_vs_100year.md",
  "raw_sources/01_dcinside_insurance_gallery_guide.md",
  "raw_sources/02_hyundai_good_and_good_policy_2026.md",
  "raw_sources/05_indemnity_health_insurance_5th_gen_2026.md",
  "market_premium_tiers_2026.md"
];

for (const f of activeGuideFiles) {
  const c = readFile(f);
  check(suite2, `${f} contains zero occurrences of '4일째'`, !c.includes("4일째"));
  check(suite2, `${f} contains zero occurrences of '2.5kg 미만'`, !c.includes("2.5kg 미만"));
}

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
  "5th gen doc defines 중증 비급여 (특약 1) 5,000만 원 annual limit",
  indemnityContent.includes("5,000만 원")
);

check(
  suite3,
  "5th gen doc defines 중증 비급여 (특약 1) 500만 원 out-of-pocket ceiling",
  indemnityContent.includes("500만 원")
);

check(
  suite3,
  "5th gen doc specifies 500만 원 out-of-pocket ceiling scope to 상급·종합병원 입원",
  indemnityContent.includes("상급·종합병원 입원") && indemnityContent.includes("500만 원")
);

check(
  suite3,
  "audit_quality_review.md specifies 500만 원 ceiling scope to 상급·종합병원 입원",
  auditContent.includes("상급·종합병원 입원") && auditContent.includes("500만 원")
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
  marketContent.includes("익명 관찰 표본") && marketContent.includes("N = 350")
);

check(
  suite5,
  "standard_50k_30yr_quote.md uses unified sample phrasing",
  quoteContent.includes("익명 온라인 표본(N=350)") && quoteContent.includes("대표성 있는 시장 선호도")
);

check(
  suite5,
  "README.md uses unified sample phrasing",
  readFile("README.md").includes("N=350 익명 온라인 관찰 표본") && readFile("README.md").includes("한계")
);

// Anonymized raw dataset verification
const rawDatasetStr = readFile("raw_sources/market_sample_350_anonymized.json");
const rawDataset = JSON.parse(rawDatasetStr);

check(
  suite5,
  "market_sample_350_anonymized.json contains exactly 350 samples",
  rawDataset.samples && rawDataset.samples.length === 350
);

check(
  suite5,
  "market_sample_350_anonymized.json metadata tier breakdown matches (217, 91, 28, 14)",
  rawDataset.metadata.tier_breakdown["Tier 1 (가성비 권장형)"] === 217 &&
  rawDataset.metadata.tier_breakdown["Tier 2 (표준 권유형)"] === 91 &&
  rawDataset.metadata.tier_breakdown["Tier 3 (초실속형)"] === 28 &&
  rawDataset.metadata.tier_breakdown["Tier 4 (프리미엄형)"] === 14
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

check(
  suite6,
  "underwriting_scenarios.md does not contain avoidance phrasing '질문 문항 축소 효과'",
  !underContent.includes("질문 문항 축소 효과")
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
// Suite 8: Dynamic Cardinality Parsing & Verification
// ------------------------------------------------------------
const suite8 = "Suite 8: Dynamic Cardinality Parsing & Verification";

interface ParsedRider {
  id: string;
  name: string;
}

function parseMatrixRiders(content: string): {
  totalRows: number;
  riderRows: ParsedRider[];
  groupCounts: number[];
} {
  const lines = content.split("\n");
  const riderRows: ParsedRider[] = [];
  
  for (const line of lines) {
    const match = line.match(/^\|\s*\*?\*?([0-9]+(?:-[0-9]+)?)\*?\*?\s*\|\s*([^|]+)\|/);
    if (match && !line.includes("번호") && !line.includes(":---")) {
      riderRows.push({ id: match[1], name: match[2].trim() });
    }
  }

  const sections = content.split(/## [0-9]+\. 제[0-9]+군:/);
  const groupCounts: number[] = [];
  for (let i = 1; i < sections.length; i++) {
    const secLines = sections[i].split("\n");
    const count = secLines.filter(l => l.match(/^\|\s*\*?\*?[0-9]+(?:-[0-9]+)?\*?\*?\s*\|/)).length;
    groupCounts.push(count);
  }

  return {
    totalRows: riderRows.length,
    riderRows,
    groupCounts
  };
}

const parsedMatrix = parseMatrixRiders(matrixContent);

check(
  suite8,
  "Dynamic parser extracted exactly 124 unique rider rows",
  parsedMatrix.totalRows === 124,
  `Expected 124, got ${parsedMatrix.totalRows}`
);

const expectedGroupCounts = [27, 39, 13, 11, 9, 11, 14];
const groupSum = parsedMatrix.groupCounts.reduce((a, b) => a + b, 0);

check(
  suite8,
  "Sum of functional groups matches total parsed rows (124)",
  groupSum === 124,
  `Group sum is ${groupSum}`
);

for (let g = 0; g < expectedGroupCounts.length; g++) {
  check(
    suite8,
    `Group ${g + 1} has exactly ${expectedGroupCounts[g]} rows`,
    parsedMatrix.groupCounts[g] === expectedGroupCounts[g],
    `Expected ${expectedGroupCounts[g]}, got ${parsedMatrix.groupCounts[g]}`
  );
}

// Verify 18 gap slots are strictly absent
const gapSlots = [56, 57, 58, 59, 60, 74, 75, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 105];
const parsedIds = new Set(parsedMatrix.riderRows.map(r => r.id));
const hasAnyGap = gapSlots.some(gap => parsedIds.has(String(gap)));

check(
  suite8,
  "All 124 parsed rows have unique IDs (zero duplicates in parsed tables)",
  parsedIds.size === 124,
  `Expected 124 unique IDs, got ${parsedIds.size}`
);

check(
  suite8,
  "None of the 18 legacy gap slots are present in parsed table",
  !hasAnyGap
);

check(
  suite8,
  "full_rider_selection_matrix.md states 124 parsed rows and formula",
  matrixContent.includes("총 124개 행") && matrixContent.includes("총 130번 슬롯 체계")
);

check(
  suite8,
  "README.md links to the reader-first guide structure",
  readFile("README.md").includes("추천 읽는 순서") && readFile("README.md").includes("SOURCE_MANIFEST.md")
);

// ------------------------------------------------------------
// Suite 9: Elimination of Deterministic, Avoidance & Hyperbolic Phrasing
// ------------------------------------------------------------
const suite9 = "Suite 9: Elimination of Deterministic, Avoidance & Hyperbolic Phrasing";

const filesToCheckHyperbole = [
  "underwriting_scenarios.md",
  "full_rider_selection_matrix.md",
  "standard_50k_30yr_quote.md",
  "audit_quality_review.md",
  "README.md",
  "direct_quote_simulation_guide.md",
  "quotes/quote_30year_vs_100year.md",
  "quotes/quote_comparison_3_insurers.md",
  "raw_sources/01_dcinside_insurance_gallery_guide.md",
  "raw_sources/02_hyundai_good_and_good_policy_2026.md",
  "raw_sources/05_indemnity_health_insurance_5th_gen_2026.md",
  "market_premium_tiers_2026.md"
];

for (const file of filesToCheckHyperbole) {
  const c = readFile(file);
  check(suite9, `${file} does not contain '100% 무심사'`, !c.includes("100% 무심사"));
  check(suite9, `${file} does not contain '100% 적발'`, !c.includes("100% 적발"));
  check(suite9, `${file} does not contain '100% 방어'`, !c.includes("100% 방어"));
}

check(
  suite9,
  "underwriting_scenarios.md does not contain internal assumption '대폭 완화'",
  !underContent.includes("단약 유지 확인 시 태아 위험 평가 대폭 완화")
);

check(
  suite9,
  "underwriting_scenarios.md does not contain internal assumption '수용률 상대적으로 우수'",
  !underContent.includes("수용률 상대적으로 우수")
);

check(
  suite9,
  "underwriting_scenarios.md does not contain internal assumption '1~2주 지나 안정 상태 확인 후 접수 권장'",
  !underContent.includes("1~2주 지나 안정 상태 확인 후 접수 권장")
);

check(
  suite9,
  "audit_quality_review.md does not contain unconditional '추가 수정 없이 가입 무방'",
  !readFile("audit_quality_review.md").includes("추가적인 수정 없이 이 설계서 조건 그대로 보험 설계사에게 견적을 의뢰하여 가입을 진행하셔도 무방합니다")
);

check(
  suite9,
  "full_rider_selection_matrix.md does not claim low birth weight riders are completely substitutable",
  !matrixContent.includes("완전 대체 가능")
);

const allPublicDocs = [
  ...activeGuideFiles,
  "SOURCE_MANIFEST.md"
];
for (const file of allPublicDocs) {
  const c = readFile(file);
  check(suite9, `${file} has no machine-specific absolute file links`, !c.includes("file:///home/upple/"));
}

check(
  suite9,
  "direct quote guide does not promise exact reproduction or permanent sharing",
  !readFile("direct_quote_simulation_guide.md").includes("100% 동일") &&
  !readFile("direct_quote_simulation_guide.md").includes("영구 공유 링크")
);

check(
  suite9,
  "30-year comparison does not promise an automatic coverage-gap solution",
  !readFile("quotes/quote_30year_vs_100year.md").includes("보장 공백") ||
  readFile("quotes/quote_30year_vs_100year.md").includes("자동으로 차단된다고 단정할 수 없습니다")
);

// ------------------------------------------------------------
// Suite 10: Audit Quality Review (limitations & Failure Conditions)
// ------------------------------------------------------------
const suite10 = "Suite 10: Audit Quality Review (limitations & Failure Conditions)";

check(
  suite10,
  "audit_quality_review.md states conditional suitability and limitations",
  auditContent.includes("조건부 적합") && auditContent.includes("공식 안내와 이중 대조")
);

check(
  suite10,
  "audit_quality_review.md defines 3 Audit Failure Conditions",
  auditContent.includes("감사 부적합/불일치 판정 조건 (Audit Failure Conditions)") &&
  auditContent.includes("산모 병력·검사 이력 보유 시") &&
  auditContent.includes("30세 만기 계약전환의 범위를 확인하지 않은 경우") &&
  auditContent.includes("5세대 실손의 비급여 보장 축소 한계")
);

// ------------------------------------------------------------
// Suite 11: Source Citation Coverage
// ------------------------------------------------------------
const suite11 = "Suite 11: Source Citation Coverage";
const sourceManifest = readFile("SOURCE_MANIFEST.md");
for (const id of ["S1", "S2", "S3", "S4", "S5", "S6", "S7"]) {
  check(suite11, `SOURCE_MANIFEST.md defines ${id}`, sourceManifest.includes(`| ${id} |`));
}

for (const file of [
  "README.md",
  "full_rider_selection_matrix.md",
  "standard_50k_30yr_quote.md",
  "direct_quote_simulation_guide.md",
  "optimal_design/optimal_prenatal_quote_final.md",
  "quotes/quote_30year_vs_100year.md",
  "quotes/quote_comparison_3_insurers.md",
  "market_premium_tiers_2026.md",
  "underwriting_scenarios.md",
  "raw_sources/02_hyundai_good_and_good_policy_2026.md",
  "raw_sources/05_indemnity_health_insurance_5th_gen_2026.md",
  "audit_quality_review.md"
]) {
  const c = readFile(file);
  check(
    suite11,
    `${file} names a reader-facing source section or manifest`,
    c.includes("SOURCE_MANIFEST.md") || c.includes("참고 페이지") || c.includes("공식 웹 출처") || c.includes("검증 웹 출처")
  );
}

for (const url of [
  "https://car.hi.co.kr/service.do?m=ebcf01fc28",
  "https://m.hi.co.kr/serviceAction.do?kw=00004F",
  "https://www.fsc.go.kr/no040000?cnId=3203",
  "https://www.law.go.kr/lsLinkCommonInfo.do?lsJoLnkSeq=1032336231",
  "https://law.go.kr/LSW/precInfoP.do?evtNo=95%EB%8B%a425268"
]) {
  check(suite11, `SOURCE_MANIFEST.md includes ${url}`, sourceManifest.includes(url));
}

// ------------------------------------------------------------
// Suite 11: 100% Clickable Verification for All Amounts (Zero Guessing Policy)
// ------------------------------------------------------------
const suite12 = "Suite 12: 100% Clickable Verification for All Amounts";

const clickableAmounts = [
  "24,770원",
  "17,790원",
  "42,560원",
  "34,870원",
  "27,000원",
  "61,870원"
];

for (const amt of clickableAmounts) {
  check(
    suite12,
    `standard_50k_30yr_quote.md has clickable link for ${amt}`,
    quoteContent.includes(`[**${amt}**](`) || quoteContent.includes(`[${amt}](`)
  );
  check(
    suite12,
    `optimal_prenatal_quote_final.md has clickable link for ${amt}`,
    finalContent.includes(`[**${amt}**](`) || finalContent.includes(`[${amt}](`)
  );
}

check(
  suite12,
  "standard_50k_30yr_quote.md has dedicated clickable verification link column in rider tables",
  quoteContent.includes("공식 약관 및 전산 검증 링크")
);

check(
  suite12,
  "optimal_prenatal_quote_final.md has dedicated clickable verification link column in rider tables",
  finalContent.includes("공식 약관 및 전산 검증 링크")
);

check(
  suite12,
  "standard_50k_30yr_quote.md links directly to official disclosure URL",
  quoteContent.includes("https://www.hi.co.kr/serviceAction.do?menuId=100340")
);

check(
  suite12,
  "optimal_prenatal_quote_final.md links directly to official disclosure URL",
  finalContent.includes("https://www.hi.co.kr/serviceAction.do?menuId=100340")
);

check(
  suite12,
  "standard_50k_30yr_quote.md links directly to simulation guide anchor",
  quoteContent.includes("direct_quote_simulation_guide.md#step-3-필수-보장-가입금액-입력-on")
);

check(
  suite12,
  "optimal_prenatal_quote_final.md links directly to simulation guide anchor",
  finalContent.includes("direct_quote_simulation_guide.md#step-3-필수-보장-가입금액-입력-on")
);

check(
  suite12,
  "market_premium_tiers_2026.md contains clickable links for stage premiums",
  marketContent.includes("[약 24,770원](") && marketContent.includes("[**월 약 42,560원**](")
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
  console.log("\n✨ All dynamic integrity checks passed successfully (100% verified)!");
  process.exit(0);
}
