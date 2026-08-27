// B"H
const { fail } = require('./json.js');
const { connectorMap } = require('../connectors/map.js');
async function routeConnector($i, vars) {
  const connector = connectorMap[vars.connector];
  if (!connector) return fail('streaming_connector_not_found', 404, { connector: vars.connector, available: Object.keys(connectorMap) });
  const action = connector.actions[vars.action || 'status'];
  if (!action) return fail('streaming_action_not_found', 404, { connector: vars.connector, action: vars.action, available: Object.keys(connector.actions) });
  return action($i, vars);
}
module.exports = { routeConnector };
