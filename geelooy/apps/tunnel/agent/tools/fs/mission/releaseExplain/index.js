// B"H
function explain(verdict = {}) { const issues = verdict.issues || []; return issues.length ? 'Release blocked: ' + issues.join('; ') : 'Release allowed after court and token.'; }
module.exports = { explain };
