// B"H
const { chatgptCatalogWorkflow } = require('../../tools/chatgpt/guidance.js');
function catalogGuidance(groups = {}) { const names = Object.values(groups).flat().map(String); return names.some(n => /^chatgpt/i.test(n)) ? { chatgpt:chatgptGuidance() } : {}; }
function chatgptGuidance() { return { preferredAction:'chatgptSeasonSaveAndContinue', workflow:chatgptCatalogWorkflow() }; }
module.exports = { catalogGuidance, chatgptGuidance };
