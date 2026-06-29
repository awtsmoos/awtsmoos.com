// B"H
/** Removal/deprecation candidates from classified disconnected files. Does not delete. */
import fs from 'node:fs';
const file = 'AI_THOUGHTS/feature_connectivity_reports/latest_feature_classification.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const candidates = data.rows.filter(r => ['generated-feature-pack-prototype','alternate-universe-stack-not-browser-critical','superseded-by-village-activity-scheduler'].includes(r.classification));
const keepReview = data.rows.filter(r => !candidates.includes(r));
const report = { ok:true, candidatesCount:candidates.length, candidates, keepReviewCount:keepReview.length, keepReview };
fs.mkdirSync('AI_THOUGHTS/feature_connectivity_reports', { recursive:true });
fs.writeFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_removal_candidates.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ok:true, candidatesCount:candidates.length, keepReviewCount:keepReview.length }, null, 2));
