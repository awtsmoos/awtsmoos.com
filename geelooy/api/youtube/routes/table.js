// B"H
const auth = require('./auth.js');
const live = require('./live.js');
const { ok } = require('../core/json.js');
const routeTable = {
  '': () => ok({ routes:Object.keys(routeTable) }),
  'auth/start': auth.start,
  'auth/callback': auth.callback,
  'auth/status': auth.status,
  'auth/logout': auth.logout,
  'live/create': live.create,
  'live/transition': live.transition
};
module.exports = { routeTable };
