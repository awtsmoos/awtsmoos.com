// B"H
export class UniverseAuditTrail { constructor() { this.rows = []; } add(type, detail = {}) { const row = { type, detail, at:new Date().toISOString() }; this.rows.push(row); return row; } snapshot() { return { rows:this.rows.length, latest:this.rows[this.rows.length-1] || null }; } }
