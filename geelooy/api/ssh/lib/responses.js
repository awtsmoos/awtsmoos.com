// B"H

"use strict";

/**
 * Creates a successful JSON-ready route response.
 *
 * @param {object} data - The extra response fields to reveal.
 * @returns {object} A normalized success shape for Awtsmoos routes.
 */
function ok(data = {}) {
  return { success: true, ...data };
}

/**
 * Turns an exception into a stable JSON-ready route response.
 *
 * @param {Error|string} error - The failure that reached the route boundary.
 * @param {object} extra - Extra fields for the response.
 * @returns {object} A normalized failure shape for Awtsmoos routes.
 */
function fail(error, extra = {}) {
  return {
    success: false,
    message: error && error.message ? error.message : String(error),
    ...extra,
  };
}

module.exports = { ok, fail };
