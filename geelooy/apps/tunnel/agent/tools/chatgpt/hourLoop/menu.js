// B"H
const Status = require('./status.js');

/** B"H — Chapter 1955: The front menu shows doors, not storms. */
function get(input = {}) {
  const status = Status.get(input);
  return { ...status, action: 'chatgptHourLoopMenu', buttons: [
    { label: 'Start from ChatGPT URL', action: 'chatgptHourLoopStart' },
    { label: 'Tick once', action: 'chatgptHourLoopTick', payload: status.nextAction },
    { label: 'Pause/Stop', action: 'chatgptHourLoopStop', payload: { conversationId: status.conversationId } },
    { label: 'Run stress probe', action: 'chatgptHourLoopStress', payload: { conversationId: status.conversationId } }
  ] };
}
module.exports = { get };
