// B"H
export class EventLog { constructor(limit = 500) { this.limit = limit; this.events = []; } push(type, data = {}) { const e = { id:`evt:${Date.now().toString(36)}:${this.events.length}`, type, data, at:new Date().toISOString() }; this.events.push(e); this.events = this.events.slice(-this.limit); return e; } list() { return [...this.events]; } }
