// B"H
/** Applies commands to a pure construction ledger, not to renderer objects yet. */
export class UniverseCommandApplicator {
  constructor() { this.applied = []; }
  apply(command) { const row = { ...command, applied:true, appliedAt:new Date().toISOString() }; this.applied.push(row); return row; }
  applyAll(commands = []) { return commands.map(c => this.apply(c)); }
  snapshot() { return { applied:this.applied.length, commands:this.applied.map(c => ({ id:c.id, type:c.type, command:c.command })) }; }
}
export default UniverseCommandApplicator;
