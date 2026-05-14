
// B"H

function ensureAttempts(didThisPath) {
  if (!didThisPath.routeAttempts) didThisPath.routeAttempts = [];
  return didThisPath.routeAttempts;
}

function recordAttempt(didThisPath, attempt) {
  ensureAttempts(didThisPath).push(attempt);
  return attempt;
}

function routeError(message, data = {}) {
  return {
    message,
    ...data
  };
}

module.exports = {
  ensureAttempts,
  recordAttempt,
  routeError
};
