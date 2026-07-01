// B"H
const os = require('os');
const path = require('path');
function root(config = {}) {
  return path.resolve(config.agentThoughtsRoot || process.env.AWTSMOOS_AGENT_THOUGHTS_ROOT || path.join(os.homedir(), '.awtsmoos-agent-thoughts'));
}
function safeName(value = 'mission') { return String(value || 'mission').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'mission'; }
function missionDir(config = {}, payload = {}) { return path.join(root(config), safeName(payload.missionId || payload.conversationName || payload.goal || 'general')); }
function instruction(config = {}, payload = {}) {
  return `Write AI planning, brainstorms, screenshots, traces, and bulky results only under ${missionDir(config, payload)}. Do not create ai-thoughts, ai_thoughts, AI_THOUGHTS, .Awtsmoos, reports, runtime-cache, or dist artifacts inside the git repo unless the user explicitly asks for a committed source file.`;
}
module.exports = { root, safeName, missionDir, instruction };
