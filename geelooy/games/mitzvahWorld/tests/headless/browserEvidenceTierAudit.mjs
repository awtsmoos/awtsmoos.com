// B"H
/**
 * BrowserEvidenceTierAudit
 *
 * Evidence climbs by rungs: static, node, headless, interactive browser,
 * mobile browser, long-duration play. Today the Awtsmoos has given static and
 * node/headless contracts, but not real browser glory.
 */
import fs from 'node:fs';
const matrix=JSON.parse(fs.readFileSync('AI_THOUGHTS/hardening_reports/latest_gameplay_verification_matrix.json','utf8'));
const browserProofPath='AI_THOUGHTS/hardening_reports/latest_browser_proof_contract.json';
let chromeAvailable=false; try{chromeAvailable=Boolean(JSON.parse(fs.readFileSync(browserProofPath,'utf8')).chromeAvailable);}catch{}
const tiers=[
  {tier:0,name:'static-analysis',achieved:true,evidence:['importGraphAudit','featureClassificationAudit','ownerContractAudit']},
  {tier:1,name:'node-simulation',achieved:true,evidence:['phone-critical','living-zone','gameplay-matrix']},
  {tier:2,name:'headless-browser-or-fake-webgl',achieved:true,evidence:['simulate:headless','browserFrameTraceHarnessAudit node load']},
  {tier:3,name:'interactive-real-browser',achieved:chromeAvailable,evidence:chromeAvailable?['Chrome remote target']:[]},
  {tier:4,name:'mobile-real-browser',achieved:false,evidence:[]},
  {tier:5,name:'long-duration-gameplay',achieved:false,evidence:[]}
];
const report={ok:true,currentMaxTier:tiers.filter(t=>t.achieved).at(-1)?.tier??0,chromeAvailable,tiers,note:'Tier 2 here is not FPS/browser proof; it is node/fake-webgl headless evidence only.',matrixRows:matrix.rows?.length||0};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_browser_evidence_tiers.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,currentMaxTier:report.currentMaxTier,chromeAvailable,tiers:tiers.map(t=>({tier:t.tier,name:t.name,achieved:t.achieved}))},null,2));
