
// B"H

function safeJson(text, fallback = {}) {
  if (!text) return fallback;

  try {
    return JSON.parse(String(text));
  } catch (e) {
    return fallback;
  }
}

/**
 * B"H
 * Reads JSON body that the Awtsmoos dynamic server already parsed, if present.
 * Falls back through several likely places because the main dynamic engine evolved.
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

    if (typeof one === "object" && !Buffer.isBuffer(one)) {
      return one;
    }

    if (typeof one === "string" || Buffer.isBuffer(one)) {
      const parsed = safeJson(one, null);
      if (parsed && typeof parsed === "object") return parsed;
    }
  }

  return {};
}

module.exports = { bodyJson, safeJson };
