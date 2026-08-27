// B"H
const auth = require('./auth.js');
const channel = require('./channel.js');
const live = require('./live.js');
const uploads = require('./uploads.js');
const videos = require('./videos.js');
const { ok } = require('../core/json.js');

const routeTable = {
	'auth/start': auth.start,
	'auth/callback': auth.callback,
	'auth/status': auth.status,
	'auth/logout': auth.logout,
	'oauth/start': auth.start,
	'oauth/callback': auth.callback,
	'oauth/status': auth.status,
	'oauth/logout': auth.logout,
	'channel': channel.mine,
	'channel/mine': channel.mine,
	'uploads/start': uploads.start,
	'videos': videos.list,
	'videos/list': videos.list,
	'videos/update': videos.update,
	'live': live.list,
	'live/list': live.list,
	'live/create': live.create,
	'live/transition': live.transition
};

routeTable[''] = () => ok({
	service: 'Awtsmoos YouTube',
	manager: '/youtube/',
	routes: Object.keys(routeTable).sort()
});

module.exports = { routeTable };
