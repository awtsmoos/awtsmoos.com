// B"H
/** @file KingdomProofLedger.js @description Dream claims enter only with witnessed metrics. */
export function createKingdomProofLedger(){ return { version:"kingdom-proof-ledger-v2-runtime-truth", entries:[] }; }
export function recordKingdomProof(ledger,name,ok,data={}){ const entry={ name, ok:Boolean(ok), data, at:Date.now() }; return { ...ledger, entries:[...(ledger.entries||[]), entry] }; }
export function proofLedgerSummary(ledger){ const e=ledger.entries||[]; return { entries:e.length, passed:e.filter(x=>x.ok).length, failed:e.filter(x=>!x.ok).length, latest:e.slice(-5) }; }
export function assertMetric(ledger,name,value,op,target){ const ok=op==="<="?value<=target:op===">="?value>=target:value===target; return recordKingdomProof(ledger,name,ok,{ value, op, target }); }
export default { createKingdomProofLedger, recordKingdomProof, proofLedgerSummary, assertMetric };
