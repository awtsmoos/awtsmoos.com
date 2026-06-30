// B"H
const Wire = require('./coreWire.js');
const Api = require('./coreApi.js');

/**
 * B"H — The public core is now a doorway, not a crowded marketplace.
 * Dependencies, wiring, and export lists live in their own small vessels, while
 * the mission API still breathes through the same `require('./core.js')` path.
 */
module.exports = Api.buildApi(Wire.buildEnv());
