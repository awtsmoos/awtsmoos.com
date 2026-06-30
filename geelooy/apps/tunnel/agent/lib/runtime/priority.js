// B"H

/**
 * B"H
 * Chapter 1228: The whisper reached the king before the caravan.
 *
 * Status, cancel, and output-page requests are tiny steering signals. If they
 * wait behind full command/test/mission work, the gateway times out and the user
 * thinks the tunnel crashed. They must keep FIFO order among themselves, while
 * still overtaking heavy work.
 */
const PRIORITY_ACTIONS = new Set([
  'commandStatus', 'commandPoll', 'commandJobStatus', 'jobStatus',
  'commandJobOutputPage', 'commandOutputPage',
  'commandCancel', 'commandJobCancel', 'commandWait', 'payloadEcho',
  'configGet', 'tunnelDoctor', 'agentDoctor'
]);

function actionOf(item = {}) {
  return String(item.data?.payload?.action || item.payload?.action || item.action || '');
}

function isPriority(item = {}) {
  return PRIORITY_ACTIONS.has(actionOf(item));
}

function enqueue(queue, item) {
  if (!isPriority(item)) {
    queue.push(item);
    return queue;
  }
  let insertAt = 0;
  while (insertAt < queue.length && isPriority(queue[insertAt])) insertAt += 1;
  queue.splice(insertAt, 0, item);
  return queue;
}

module.exports = { PRIORITY_ACTIONS, actionOf, enqueue, isPriority };
