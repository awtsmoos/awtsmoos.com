// B"H
const { routeTable } = require('./routes/table.js');
const { fail } = require('./core/json.js');
function clean(name) { return String(name || '').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, ''); }
async function call($i, name, vars) {
  const key = clean(name); const handler = routeTable[key] || routeTable[''];
  if (!handler) return fail('streaming_route_not_found', 404, { route: key, available: Object.keys(routeTable) });
  try { return await handler($i, vars || {}); } catch (e) { return fail(e.message || 'streaming_route_failed', 500, { stack: e.stack }); }
}
module.exports = { dynamicRoutes: async $i => { $i.response.setHeader('Access-Control-Allow-Origin', '*'); $i.response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); $i.response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); $i.response.setHeader('Cache-Control', 'no-store'); await $i.use('', vars => call($i, '', vars)); await $i.use(':connector', vars => call($i, 'connector', { ...vars, action: 'status' })); await $i.use(':connector/:action', vars => call($i, 'connector', vars)); } };
