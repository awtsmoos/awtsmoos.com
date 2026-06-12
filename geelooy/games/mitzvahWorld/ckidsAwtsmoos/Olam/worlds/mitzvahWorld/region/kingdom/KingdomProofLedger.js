// B"H
/**
 * @file KingdomProofLedger.js
 * @description The kingdom may dream, but the ledger demands witnessed truth.
 */
export function createKingdomProofLedger() {
  return { version: "kingdom-proof-ledger-v1", entries: [] };
}

export function recordKingdomProof(ledger, name, ok, data = {}) {
  const entry = { name, ok: Boolean(ok), data, at: Date.now() };
  return { ...ledger, entries: [...(ledger.entries || []), entry] };
}

export function proofLedgerSummary(ledger) {
  const entries = ledger.entries || [];
  return { entries: entries.length, passed: entries.filter(e => e.ok).length, failed: entries.filter(e => !e.ok).length };
}
