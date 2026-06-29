// B"H
export class TaskbarModel {
  constructor(handler) { this.handler = handler; this.notifications = []; }
  notify(text, kind = "info") { this.notifications.push({ text, kind, at:new Date().toISOString() }); return this.notifications.at(-1); }
  snapshot() { return { open:(this.handler?.windows || []).map(w => ({ title:w.title, programId:w.programId, minimized:!!w.minimized })), notifications:this.notifications.slice(-10), clock:new Date().toLocaleTimeString(), tunnels:window.VirtualOSTunnelAgent ? "available" : "off" }; }
}
