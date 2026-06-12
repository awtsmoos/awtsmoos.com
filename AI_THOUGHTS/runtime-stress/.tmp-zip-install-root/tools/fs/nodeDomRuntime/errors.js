// B"H
function normalizeError(error, phase = "runtime") {
  return { message: error?.message || String(error), stack: error?.stack || "", phase };
}

function pushError(errors, error, phase) {
  errors.push(normalizeError(error, phase));
}

module.exports = { normalizeError, pushError };
