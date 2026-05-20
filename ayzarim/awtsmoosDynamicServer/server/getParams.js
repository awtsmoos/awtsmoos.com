// B"H

const PLAIN_TEXT_QUERY_KEYS = new Set([
  "content",
  "find",
  "query",
  "replace",
  "body",
  "command",
  "scriptText",
  "text",
  "expression",
  "testCode",
  "html"
]);

/**
 * B"H
 * Parses one query value without devouring sacred plain text.
 *
 * @param {string} key Query key.
 * @param {string} value Raw value.
 * @returns {unknown} JSON value or raw string.
 */
function parseQueryValue(key, value) {
  if (PLAIN_TEXT_QUERY_KEYS.has(String(key))) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

/**
 * B"H
 * Parses GET params from URLSearchParams.
 *
 * @param {URL} fullUrl Request URL.
 * @returns {object} Parsed GET params.
 */
function parseGetParams(fullUrl) {
  const params = Object.fromEntries(fullUrl.searchParams.entries());

  for (const key of Object.keys(params)) {
    params[key] = parseQueryValue(key, params[key]);
  }

  return params;
}

module.exports = { parseGetParams, parseQueryValue, PLAIN_TEXT_QUERY_KEYS };
