// B"H
const Status = require('./status.js');

/** B"H — Chapter 1967: The menu exposes cycle and promotion without noise. */
function get(input = {}) {
  const status = Status.get(input);
  return { ...status, action: 'chatgptHourLoopMenu', buttons: [
    { label: 'Start from ChatGPT URL', action: 'chatgptHourLoopStart' },
    { label: `Tick once (${status.phase})`, action: 'chatgptHourLoopTick', payload: status.nextAction },
    { label: 'Promote to new chat', action: 'chatgptHourLoopPromote', payload: { conversationId: status.conversationId } },
    { label: 'Pause/Stop', action: 'chatgptHourLoopStop', payload: { conversationId: status.conversationId } },
    { label: 'Run stress probe', action: 'chatgptHourLoopStress', payload: { conversationId: status.conversationId } }
  ] };
}
module.exports = { get };
