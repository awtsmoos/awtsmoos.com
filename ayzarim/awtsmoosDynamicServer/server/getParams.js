
// B"H

/**
 * B"H
 * Parses one query value.
 *
 * @param {string} value Raw value.
 * @returns {unknown} JSON value or raw string.
 */
function parseQueryValue(value) {
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
    params[key] = parseQueryValue(params[key]);
  }

  return params;
}

module.exports = { parseGetParams };
