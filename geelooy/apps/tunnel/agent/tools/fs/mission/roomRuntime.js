// B"H
const Identity = require('./roomRuntime/identity.js');
const Queues = require('./roomRuntime/queues.js');
const Work = require('./roomRuntime/work.js');
const Graph = require('./roomRuntime/graph.js');
const Health = require('./roomRuntime/health.js');

/**
 * B"H — The room runtime is now only a gate, not a warehouse.
 * Each helper keeps one vessel small: identity, queues, work choice, graph,
 * and health. The mission remains alive until the user truly stops it.
 */
module.exports = {
  ...Identity,
  ...Queues,
  ...Work,
  ...Graph,
  ...Health
};
