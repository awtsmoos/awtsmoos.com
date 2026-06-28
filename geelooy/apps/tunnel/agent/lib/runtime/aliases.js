// B"H
const aliases = { command: ['commandRun','commandStart'], commandRun: ['commandStart'], commandStart: ['commandStart'], commandStatus: ['commandStatus','commandStart'], commandPoll: ['commandStatus','commandStart'], commandJobStatus: ['commandStatus','commandStart'], commandWait: ['commandWait','commandStatus','commandStart'], commandJobWait: ['commandWait','commandStatus','commandStart'], commandJobOutputPage: ['commandJobOutputPage'], commandOutputPage: ['commandJobOutputPage'], commandCancel: ['commandCancel'], commandJobCancel: ['commandCancel'] };
function allowed(requestAction, actualAction) { return requestAction === actualAction || (aliases[requestAction] || []).includes(actualAction); }
module.exports = { allowed };
