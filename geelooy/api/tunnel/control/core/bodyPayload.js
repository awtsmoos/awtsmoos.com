
// B"H

/**
 * B"H
 * Parses JSON safely from text or Buffer.
 *
 * @param {unknown} text JSON text.
 * @param {unknown} fallback Fallback value.
 * @returns {unknown} Parsed value.
 */
function safeJson(text, fallback = {}) {
  if (!text) return fallback;

  try {
    const raw = Buffer.isBuffer(text) ? text.toString("utf8") : String(text);
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

/**
 * B"H
 * Checks whether an object contains real user payload keys.
 *
 * @param {unknown} value Candidate payload.
 * @returns {boolean} Whether useful keys exist.
 */
function hasUserPayload(value) {
  if (!value || typeof value !== "object" || Buffer.isBuffer(value)) {
    return false;
  }

  return Object.keys(value).some(key => !String(key).startsWith("__"));
}

/**
 * B"H
 * Gets parsed JSON/body params from the dynamic server.
 *
 * The dynamic server now parses application/json directly into
 * paramKinds.POST. This fallback still understands older raw-body wrappers.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} Parsed body object.
 */
function bodyJson($i) {
  const candidates = [
    $i?.$_POST,
    $i?.paramKinds?.POST,
    $i?.request?.body,
    $i?.request?.post,
    $i?.body
  ];

  for (const one of candidates) {
    if (!one) continue;

    if (hasUserPayload(one)) return one;

    if (typeof one === "string" || Buffer.isBuffer(one)) {
      const parsed = safeJson(one, null);
      if (hasUserPayload(parsed)) return parsed;
    }

    if (one.__raw_body__) {
      const parsed = safeJson(one.__raw_body__, null);
      if (hasUserPayload(parsed)) return parsed;
    }
  }

  return {};
}

module.exports = { bodyJson, safeJson };
