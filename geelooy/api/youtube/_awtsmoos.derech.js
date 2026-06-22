// B"H
const { routeTable } = require('./routes/table.js');
const { fail } = require('./core/json.js');
function clean(name) { return String(name || '').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, ''); }
async function call($i, name, vars) {
  const key = clean(name); const handler = routeTable[key] || routeTable[''];
  if (!handler) return fail('youtube_route_not_found', 404, { route:key, available:Object.keys(routeTable) });
  try { return await handler($i, vars || {}); } catch (e) { return fail(e.message || 'youtube_route_failed', 500, { stack:e.stack }); }
}
module.exports = { dynamicRoutes: async $i => { $i.response.setHeader('Access-Control-Allow-Origin', '*'); $i.response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); $i.response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); $i.response.setHeader('Cache-Control', 'no-store'); await $i.use('', v => call($i, '', v)); await $i.use(':a', v => call($i, v.a, v)); await $i.use(':a/:b', v => call($i, `${v.a}/${v.b}`, v)); } };
