// B"H
const C = require('./constants.js');

/** B"H — Chapter 1942: The only exits are marked with evidence. */
function check(input = {}) {
  const reasons = [];
  if (input.userStop || input.status === 'stopped') reasons.push('user_stop');
  if (input.authenticated === false) reasons.push('not_authenticated');
  if (unexpected(input.href || input.url)) reasons.push('unexpected_navigation');
  if (input.promptFound === false) reasons.push('composer_missing');
  if (Number(input.sameFailureCount || 0) >= C.MAX_SAME_FAILURE) reasons.push('repeated_failure');
  if (Number(input.repeatedNextCount || 0) >= C.MAX_REPEATED_NEXT) reasons.push('repeated_next_action');
  if (input.dangerous && input.confirm !== true) reasons.push('dangerous_action_needs_confirmation');
  return { stop: reasons.length > 0, reasons };
}

function unexpected(url = '') {
  return /^(about:blank|chrome:|chrome-error:|edge:|about:newtab)/i.test(String(url || ''));
}

module.exports = { check, unexpected };
