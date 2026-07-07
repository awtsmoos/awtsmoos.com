// B"H
const Custom = require('./customGpt.js');

/** B"H — Chapter 1962: Every sixth spark becomes a torch for another mind. */
function requestPrompt(input = {}) {
  return [
    'B"H Write a long practical handoff prompt for another AI agent.',
    'Include absolute paths for every relevant file already known.',
    'Do not include extreme ritual planning; make it realistic and directly actionable.',
    'Include: goal, current state, tests passed, files touched, next exact steps, emergency exits.',
    `Current goal: ${input.goal || input.objective || 'continue the Awtsmoos tunnel mission'}.`,
    `Known root: ${input.root || '/Users/awtsmoos/Documents/Awtsmoos/git/Awtsmoos.com/geelooy/apps/tunnel/agent'}.`,
    'End with a compact next action payload.'
  ].join('\n');
}
function newChatTarget(sourceUrl = '') { return { url: Custom.newChatUrl(Custom.parse(sourceUrl)), source: Custom.parse(sourceUrl) }; }
function prepare(input = {}) { return { shouldOpenNewChat: true, target: newChatTarget(input.sourceUrl || input.url || ''), prompt: input.handoffText || requestPrompt(input) }; }
module.exports = { requestPrompt, newChatTarget, prepare };
