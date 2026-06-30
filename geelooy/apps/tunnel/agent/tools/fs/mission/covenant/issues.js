// B"H
const E = require('./exceptions.js');
function policy(m = {}) { return m.finalizationPolicy || {}; }
function requireApproval(m = {}, input = {}) {
  if (E.truthy(input.skipUserApprovalForSafetyGate)) return false;
  return policy(m).requireExplicitUserApproval !== false;
}
function approved(m = {}, input = {}) {
  return E.truthy(input.userApprovedRelease) || E.truthy(input.releaseApprovedByUser) ||
    E.truthy(input.completedObjectiveApprovedByUser) || E.truthy(input.explicitUserApproval) ||
    E.truthy(m.releaseApproval?.approved) || E.truthy(m.finalizationPolicy?.userApprovedRelease);
}
function softStopIssues(input = {}) {
  const issues = [];
  if (E.truthy(input.commandTreeEnded)) issues.push('command_tree_ended_is_not_release');
  if (E.truthy(input.queueEmpty)) issues.push('queue_empty_is_not_release');
  if (E.truthy(input.actionCompleted)) issues.push('action_completed_is_not_release');
  if (E.truthy(input.objectiveCompleted) && !E.truthy(input.completedObjectiveApprovedByUser)) issues.push('completed_objective_requires_explicit_user_approval');
  return issues;
}
function releaseIssues(m = {}, input = {}) {
  if (E.exceptionStop(input)) return [];
  const issues = softStopIssues(input);
  if (requireApproval(m, input) && !approved(m, input)) issues.push('user_release_approval_missing');
  return [...new Set(issues)];
}
module.exports = { approved, requireApproval, softStopIssues, releaseIssues };
