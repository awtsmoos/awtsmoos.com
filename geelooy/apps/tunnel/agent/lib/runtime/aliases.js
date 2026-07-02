// B"H
/**
 * B"H
 * Alias law: a path may have many doorways, but the returning messenger must
 * know which doorway the caller used. This table is the treaty for canonical
 * workers, envelope mismatch checks, and future schedulers.
 */
const aliases = {
  command: ['commandRun', 'commandStart'],
  commandRun: ['commandStart'],
  commandStart: ['commandStart'],
  commandStatus: ['commandStatus', 'commandStart'],
  commandPoll: ['commandPoll', 'commandStatus', 'commandStart'],
  commandJobStatus: ['commandJobStatus', 'commandStatus', 'commandStart'],
  commandWait: ['commandWait', 'commandStatus', 'commandStart'],
  commandJobWait: ['commandJobWait', 'commandWait', 'commandStatus', 'commandStart'],
  commandJobOutputPage: ['commandJobOutputPage'],
  commandOutputPage: ['commandOutputPage', 'commandJobOutputPage'],
  commandCancel: ['commandCancel'],
  commandJobCancel: ['commandJobCancel', 'commandCancel']
};

function allowed(requestAction, actualAction) {
  return requestAction === actualAction || (aliases[requestAction] || []).includes(actualAction);
}

module.exports = { aliases, allowed };
