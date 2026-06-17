// B"H
export function universeLedgerReport(ledger) { return { hasLedger:Boolean(ledger), summary:ledger?.summary?.() || null, events:ledger?.data?.events?.length || 0 }; }
