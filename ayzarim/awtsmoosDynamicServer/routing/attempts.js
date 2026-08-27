
// B"H

function ensureAttempts(didThisPath) {
  if (!didThisPath.routeAttempts) {
    didThisPath.routeAttempts = [];
  }

  return didThisPath.routeAttempts;
}

function recordAttempt(didThisPath, attempt) {
  ensureAttempts(didThisPath).push({
    time: new Date().toISOString(),
    ...attempt
  });

  return attempt;
}

function shortAttempts(didThisPath, max = 40) {
  return ensureAttempts(didThisPath).slice(-max);
}

module.exports = {
  ensureAttempts,
  recordAttempt,
  shortAttempts
};
