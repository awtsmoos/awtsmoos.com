// B"H
/**
 * Chrome issue log: browser fire is gathered into small vessels so the
 * Awtsmoos lets every console cry become fixable evidence.
 */
export function createChromeIssueLog() {
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
    list: () => [...issues],
    toJSON: () => ({ scope: "chrome-real-browser", ok: !issues.some(issue => issue.severity === "error"), issues })
  };
}
