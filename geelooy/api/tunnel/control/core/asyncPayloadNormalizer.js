// B"H

const ASYNC_ACTIONS = new Set(["commandWait", "commandStatus", "commandJobOutputPage", "commandOutputPage"]);
const JOB_FIELDS = ["jobId", "id", "job", "taskId"];
const NESTED_FIELDS = ["params", "waitPayload", "statusPayload", "stdoutPagePayload", "stderrPagePayload", "nextPagePayload"];

/**
 * B"H
 * Chapter 820: The old agents arrived with crooked cups, and the gate poured
 * the coffee into one clean vessel instead of refusing them.
 */
function normalizeAsyncPayload(payload = {}) {
  if (!ASYNC_ACTIONS.has(String(payload.action || ""))) return payload;
  const nested = nestedObjects(payload);
  payload.jobId = payload.jobId || firstJob(payload, nested);
  payload.stream = normalizeStream(payload, nested);
  payload.offsetChars = firstNumber(payload, nested, ["offsetChars", "offset", "cursor", "start", "from"], 0);
  payload.maxChars = firstNumber(payload, nested, ["maxChars", "limit", "pageChars", "maxText"], payload.maxChars);
  if (!payload.jobId) payload.asyncPayloadError = missingJobId(payload.action);
  return payload;
}

function nestedObjects(payload) {
  return NESTED_FIELDS.map(key => parseMaybe(payload[key])).filter(value => value && typeof value === "object");
}
function parseMaybe(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch { return null; }
}
function firstJob(payload, nested) {
  for (const key of JOB_FIELDS) if (payload[key]) return payload[key];
  for (const item of nested) for (const key of JOB_FIELDS) if (item[key]) return item[key];
  return "";
}
function normalizeStream(payload, nested) {
  if (payload.stream) return payload.stream;
  if (payload.stderr || payload.logStream === "stderr" || payload.stderrPagePayload) return "stderr";
  for (const item of nested) if (item.stream) return item.stream;
  return "stdout";
}
function firstNumber(payload, nested, keys, fallback) {
  for (const key of keys) if (payload[key] !== undefined && payload[key] !== "") return payload[key];
  for (const item of nested) for (const key of keys) if (item[key] !== undefined && item[key] !== "") return item[key];
  return fallback;
}
function missingJobId(action) {
  return {
    ok: false,
    error: "missing_job_id",
    action,
    acceptedJobIdFields: ["jobId", "id", "job", "taskId", "params.jobId", "waitPayload.jobId", "statusPayload.jobId", "stdoutPagePayload.jobId", "stderrPagePayload.jobId"],
    examples: [
      { action, jobId: "cmdjob_..." },
      { action, params: JSON.stringify({ jobId: "cmdjob_...", stream: "stdout" }) }
    ]
  };
}

module.exports = { normalizeAsyncPayload, missingJobId };
