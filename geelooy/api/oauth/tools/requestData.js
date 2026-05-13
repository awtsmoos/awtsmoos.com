
// B"H

/**
 * B"H
 * Reads GET params from the Awtsmoos dynamic server context.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} Query params.
 */
function getQuery($i) {
  return $i.paramKinds?.GET || $i.$_GET || {};
}

/**
 * B"H
 * Reads POST params from the Awtsmoos dynamic server context.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {Promise<object>} POST params.
 */
async function getBody($i) {
  try {
    if ($i.request.method !== "POST") return {};
    await $i.getPostData();
    return $i.paramKinds?.POST || $i.$_POST || {};
  } catch (e) {
    return {};
  }
}

module.exports = { getQuery, getBody };
