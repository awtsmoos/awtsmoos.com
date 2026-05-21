//B"H

/**
 * Chapter 10: The Lantern Learned Restraint.
 *
 * The split-browser relay must reveal failures and living API motion without
 * drowning the terminal in asset dust. Routine JS/CSS/images stay quiet unless
 * verbose mode is enabled; POSTs, APIs, auth, redirects, rewrites, and errors
 * speak clearly.
 *
 * @param {{verbose?:boolean}} config Runtime config.
 * @param {string} label Event label.
 * @param {Record<string, unknown>} facts Safe diagnostic facts.
 * @returns {void}
 */
function log(config, label, facts = {}) {
  if (!config?.verbose && !isImportant(label, facts)) return;
  console.log(`B"H split ${label}`, JSON.stringify(redact(facts)));
}

function isImportant(label, facts) {
  if (/^(server|error|rewrite)/.test(label)) return true;
  if (facts.status && (facts.status >= 400 || facts.status < 300 === false && facts.status >= 300)) return true;
  if (facts.method && facts.method !== "GET") return true;
  const path = String(facts.local || facts.path || facts.url || "");
  if (/[?&]_data=/.test(path)) return true;
  if (/\/(backend|backend-anon|api|auth|ces|cdn-cgi)\b/.test(path)) return true;
  if (facts.mode && facts.mode !== "raw") return true;
  return false;
}

function redact(value) {
  if (!value || typeof value !== "object") return value;
  const out = Array.isArray(value) ? [] : {};
  for (const [key, item] of Object.entries(value)) {
    if (/cookie|authorization|token/i.test(key)) out[key] = "[redacted]";
    else if (Array.isArray(item) && /headerNames/i.test(key)) out[key] = item.slice(0, 60);
    else out[key] = item;
  }
  return out;
}

module.exports = { log, isImportant };
