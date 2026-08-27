// B"H
const { ok } = require('../core/json.js');
const { connectorMap } = require('../connectors/map.js');
const { routeConnector } = require('../core/router.js');
async function index() { return ok({ service: 'streaming', connectors: Object.keys(connectorMap), patterns: ['/api/streaming/:connector/:action'] }); }
const routeTable = { '': index, connector: routeConnector };
module.exports = { routeTable };
