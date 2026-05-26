//B"H

/**
 * Chapter 10: The Lantern Learned Deeper Restraint.
 *
 * By default the relay should not log every request. It speaks on errors,
 * blocked/failed status, and explicit verbose mode only. This keeps terminal
 * output usable while still surfacing the things that actually need attention.
 */
function log(config, label, facts = {}) {
  if (!config?.verbose && !isImportant(label, facts)) return;
  console.log(`B"H split ${label}`, JSON.stringify(redact(facts)));
}

function isImportant(label, facts = {}) {
  if (/error|fail|blocked|timeout/i.test(label)) return true;
  if (facts.error || facts.blocked || facts.timedOut) return true;
  if (Number(facts.status) >= 400) return true;
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
