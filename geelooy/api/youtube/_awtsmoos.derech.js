// B"H
const { fail, packet } = require('./core/json.js');
const { routeTable } = require('./routes/table.js');

function clean(value) {
	return String(value || '').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
}

async function call($i, name, variables) {
	const route = clean(name);
	const handler = routeTable[route];
	if (!handler) return fail('youtube_route_not_found', 404, { route, available: Object.keys(routeTable).sort() });
	try {
		return await handler($i, variables || {});
	} catch (error) {
		console.error('B"H YouTube route failed', route, error?.code || error?.message);
		return fail(error, error?.statusCode || 500);
	}
}

function options() {
	return packet({ BH: 'B"H', ok: true }, 204, {
		Allow: 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type'
	});
}

module.exports = {
	dynamicRoutes: async $i => {
		$i.response.setHeader('Cache-Control', 'private, no-store, max-age=0');
		$i.response.setHeader('Referrer-Policy', 'same-origin');
		$i.response.setHeader('X-Content-Type-Options', 'nosniff');
		if (String($i.request.method || '').toUpperCase() === 'OPTIONS') {
			await $i.use('', options);
			await $i.use(':a', options);
			await $i.use(':a/:b', options);
			await $i.use(':a/:b/:c', options);
			return;
		}
		await $i.use('', variables => call($i, '', variables));
		await $i.use(':a', variables => call($i, variables.a, variables));
		await $i.use(':a/:b', variables => call($i, `${variables.a}/${variables.b}`, variables));
		await $i.use(':a/:b/:c', variables => call($i, `${variables.a}/${variables.b}/${variables.c}`, variables));
	}
};
