
// B"H

/**
 * B"H
 * Gets GET query params from the Awtsmoos route context.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {object} Query params.
 */
function getQuery($i) {
  return $i.paramKinds?.GET || $i.$_GET || {};
}

/**
 * B"H
 * Gets POST body params from the Awtsmoos route context.
 *
 * @param {object} $i Awtsmoos route context.
 * @returns {Promise<object>} Body params.
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
