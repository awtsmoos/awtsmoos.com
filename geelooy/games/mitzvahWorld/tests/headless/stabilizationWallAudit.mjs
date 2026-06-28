// B"H
/**
 * StabilizationWallAudit
 * Bounded wrapper only. Heavy suites are run by package scripts directly; this
 * audit verifies reports and known gates exist without nesting long npm chains.
 */
import fs from 'node:fs';
const requiredFiles = [
  'AI_THOUGHTS/hardening_reports/latest_boot_runtime_integrity.json',
  'AI_THOUGHTS/hardening_reports/latest_render_architecture.json',
  'AI_THOUGHTS/hardening_reports/latest_simulation_ownership.json',
  'AI_THOUGHTS/hardening_reports/latest_event_architecture.json',
  'AI_THOUGHTS/hardening_reports/latest_allocation_audit.json',
  'AI_THOUGHTS/hardening_reports/latest_ui_ownership.json',
  'AI_THOUGHTS/hardening_reports/latest_asset_pipeline.json',
  'AI_THOUGHTS/hardening_reports/latest_gameplay_verification_matrix.json',
  'AI_THOUGHTS/hardening_reports/latest_browser_proof_contract.json'
];
const missing = requiredFiles.filter(file => !fs.existsSync(file));
const bad = [];
for (const file of requiredFiles.filter(file => fs.existsSync(file))) {
  try { const json = JSON.parse(fs.readFileSync(file, 'utf8')); if (json.ok === false) bad.push(file); }
  catch { bad.push(file); }
}
const report = { ok:missing.length === 0 && bad.length === 0, missing, bad, checked:requiredFiles.length, note:'Bounded wall; run test:phone-critical and test:hardening-audits for active execution.' };
fs.mkdirSync('AI_THOUGHTS/stabilization_wall', { recursive:true });
fs.writeFileSync('AI_THOUGHTS/stabilization_wall/latest_stabilization_wall.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
