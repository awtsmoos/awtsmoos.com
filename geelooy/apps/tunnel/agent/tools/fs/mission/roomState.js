// B"H
const Base = require('./roomState/base.js');
const Status = require('./roomState/status.js');
const Live = require('./roomState/live.js');

/**
 * B"H — A small public doorway for room state.
 * The implementation is split so each vessel stays readable while callers keep
 * the old import path and the mission keeps breathing through scheduler state.
 */
module.exports = {
  ...Base,
  status: Status.status,
  live: Live.live,
  agentProcessViews: Live.agentProcessViews,
  modulePreviewLinks: Live.modulePreviewLinks
};
