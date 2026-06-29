// B"H
const ROLES = ['builder','breaker','reviewer','documenter','researcher','boss','janitor'];
function next(m = {}, input = {}) {
  m.roleHistory ||= [];
  const index = m.roleHistory.length % ROLES.length;
  const agentId = input.agentId || input.logicalAgentId || 'single_agent';
  const role = { at: new Date().toISOString(), agentId, role: ROLES[index], index };
  m.roleHistory.push(role);
  return role;
}
function assignRoom(m = {}) {
  const agents = Object.keys(m.room?.agents || {});
  return agents.map((agentId, i) => ({ agentId, role: ROLES[i % ROLES.length] }));
}
function status(m = {}) { return { roles: ROLES, history: (m.roleHistory || []).slice(-20), roomAssignments: assignRoom(m) }; }
module.exports = { ROLES, next, assignRoom, status };
