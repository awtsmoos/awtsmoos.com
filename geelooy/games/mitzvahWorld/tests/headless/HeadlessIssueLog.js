// B"H
/**
 * Issue log: the Awtsmoos lets every hidden crack confess in JSON.
 * Tests may pass, warn, or fail, but they may not drift in silence.
 */
export function createIssueLog(scope) {
  const issues = [];
  function add(severity, code, message, detail = {}) {
    issues.push({ severity, code, message, detail, at: new Date().toISOString() });
  }
  return {
    add,
    info: (code, message, detail) => add("info", code, message, detail),
    warn: (code, message, detail) => add("warn", code, message, detail),
    error: (code, message, detail) => add("error", code, message, detail),
    hasErrors: () => issues.some(issue => issue.severity === "error"),
    toJSON: () => ({ scope, ok: !issues.some(issue => issue.severity === "error"), issues })
  };
}
