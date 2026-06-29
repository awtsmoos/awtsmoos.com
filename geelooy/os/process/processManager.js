// B"H
import { processRecord } from "./process.js";
export class ProcessManager { constructor(graph) { this.graph = graph; this.processes = new Map(); } spawn(input) { const p = processRecord(input); this.processes.set(p.pid, p); this.graph?.upsert?.({ id:p.pid, type:"process", title:p.title, data:p }); return p; } list() { return [...this.processes.values()]; } stop(pid) { const p = this.processes.get(pid); if (p) p.status = "stopped"; return p || null; } }
