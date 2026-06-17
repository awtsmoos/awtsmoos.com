// B"H
const RATES = Object.freeze({ routingRequest: 0.0001, routingKb: 0.00001, computeSecond: 0.25, virtualSecond: 0.5, storageMbDay: 0.02, gpuSecond: 5, failedDiscount: 0.25 });

/** B"H: Cost follows where the work actually burns. */
function routeKind(action = "", vessel = "") {
  const text = `${action} ${vessel}`.toLowerCase();
  if (/virtual-os|hosted|previewrender|server/.test(text)) return "compute";
  if (/gpu|image|video/.test(text)) return "gpu";
  if (/storage|blob|persist|preview/.test(text)) return "storage";
  return "routing";
}
function estimate(entry = {}) {
  const category = entry.category || routeKind(entry.action, entry.vessel || entry.tunnelName);
  const bytes = Math.max(0, Number(entry.bytes || entry.estimatedBytes || 0));
  const seconds = Math.max(0, Number(entry.seconds || entry.estimatedSeconds || 0));
  const files = Math.max(0, Number(entry.files || entry.estimatedFiles || 0));
  const base = category === "routing" ? RATES.routingRequest : category === "gpu" ? 1 : 0.05;
  let cost = base + files * 0.0005;
  if (category === "routing") cost += Math.ceil(bytes / 1024) * RATES.routingKb;
  if (category === "compute") cost += seconds * RATES.computeSecond;
  if (category === "gpu") cost += seconds * RATES.gpuSecond;
  if (category === "storage") cost += Math.ceil(bytes / 1048576) * RATES.storageMbDay;
  if (entry.ok === false) cost *= RATES.failedDiscount;
  return round(cost);
}
function payloadEstimate(payload = {}) {
  const bytes = Math.max(Number(payload.maxBytes || 0), Number(payload.totalMaxBytes || 0), Number(payload.totalMaxChars || 0), Number(payload.maxChars || 0));
  const files = Math.max(Number(payload.maxFiles || 0), Number(payload.pageSize || 0), Array.isArray(payload.paths) ? payload.paths.length : 0, payload.files && typeof payload.files === "object" ? Object.keys(payload.files).length : 0);
  const seconds = Math.max(0, Number(payload.timeoutMs || 0) / 1000);
  const action = String(payload.action || "unknown");
  const category = routeKind(action, payload.tunnelName || payload.vessel);
  return { action, category, estimatedBytes: bytes, estimatedFiles: files, estimatedSeconds: seconds, estimatedPerutas: estimate({ action, category, estimatedBytes: bytes, estimatedFiles: files, estimatedSeconds: seconds }) };
}
function round(value) { return Number(Number(value || 0).toFixed(9)); }
module.exports = { RATES, estimate, payloadEstimate, routeKind, round };
