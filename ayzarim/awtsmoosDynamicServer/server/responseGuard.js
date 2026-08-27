
// B"H

/**
 * B"H
 * Prevents duplicate response.end calls from crashing routes.
 *
 * @param {object} response Outgoing response.
 * @returns {object} Same response, guarded.
 */
function guardResponseEnd(response) {
  const oldEnd = response.end;
  let ended = false;

  response.end = function guardedEnd(...args) {
    if (ended) return;
    ended = true;
    oldEnd.bind(response)(...args);
  };

  return response;
}

module.exports = { guardResponseEnd };
