// B"H
import fs from 'node:fs';
const trace=fs.readFileSync('systems/performance/BrowserFrameTraceHarness.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const report={ok:trace.includes('realBrowser')&&trace.includes('longTasks')&&trace.includes('rendererReady')&&html.includes('BrowserFrameTraceHarness.js'), chromeAvailable:false, note:'Contract exists. Real Chrome proof still requires remote debugging target.'};
fs.mkdirSync('AI_THOUGHTS/hardening_reports',{recursive:true}); fs.writeFileSync('AI_THOUGHTS/hardening_reports/latest_browser_proof_contract.json',JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2)); if(!report.ok) process.exit(1);
