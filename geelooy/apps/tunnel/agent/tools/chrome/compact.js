// B"H
function limitText(text, max = 12000) {
  text = String(text ?? "");
  return text.length <= max ? { text, truncated:false, chars:text.length } : { text:text.slice(0, max), truncated:true, chars:text.length };
}
function valueSummary(value, max = 16000) {
  const type = Array.isArray(value) ? "array" : value === null ? "null" : typeof value;
  if (typeof value === "string") return { type, ...limitText(value, max) };
  if (type === "number" || type === "boolean" || type === "null") return { type, value };
  let text = "";
  try { text = JSON.stringify(value); } catch { text = String(value); }
  const clipped = limitText(text, max);
  let parsed = null;
  if (!clipped.truncated) { try { parsed = JSON.parse(clipped.text); } catch {} }
  return { type, value:parsed, json:parsed ? undefined : clipped.text, truncated:clipped.truncated, chars:clipped.chars };
}
function compactRemoteResult(result = {}, maxValueChars = 16000) {
  const rr = result.result || {};
  return { result:{ type:rr.type || typeof rr.value, valueSummary:valueSummary(rr.value, maxValueChars), description:limitText(rr.description || "", 2000).text }, exceptionDetails:result.exceptionDetails ? { text:result.exceptionDetails.text || "", lineNumber:result.exceptionDetails.lineNumber, columnNumber:result.exceptionDetails.columnNumber, exception:valueSummary(result.exceptionDetails.exception?.description || result.exceptionDetails.exception || "", 4000) } : null };
}
function compactLogs(logRead = {}, maxLogs = 40) {
  const logs = Array.isArray(logRead.logs) ? logRead.logs.slice(-Math.max(0, Number(maxLogs || 40))) : [];
  return { count:logs.length, totalBuffered:logRead.totalBuffered || logs.length, cleared:Boolean(logRead.cleared), networkLog:logRead.networkLog || "", logs:logs.map(x => ({ ts:x.ts, iso:x.iso, source:x.source, level:x.level, message:limitText(x.message || "", 1000).text, details:valueSummary(x.details || {}, 2000) })) };
}
function compactExpression(expression = "") { return limitText(expression, 2000); }
module.exports = { limitText, valueSummary, compactRemoteResult, compactLogs, compactExpression };
