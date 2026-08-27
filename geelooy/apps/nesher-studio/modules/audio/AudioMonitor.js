/* B"H */
export function createAudioMonitor(input = {}) { return { kind:'AudioMonitor', enabled:input.enabled ?? false, busId:input.busId || 'monitor', volume:Number(input.volume ?? 1) }; }
export function setMonitorEnabled(monitor, enabled) { monitor.enabled = !!enabled; return monitor; }
