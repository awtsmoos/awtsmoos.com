// B"H
export function installIntoLedger(ledger, path, value) { if (ledger?.set) ledger.set(path, value); return { path, installed:Boolean(ledger?.set), value }; }
