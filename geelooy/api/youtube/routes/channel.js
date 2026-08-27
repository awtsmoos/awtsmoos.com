// B"H
const { youtube } = require('../core/client.js');
const { requireIdentity } = require('../core/identity.js');
const { ok } = require('../core/json.js');

async function mine($i) {
	const identity = await requireIdentity($i);
	const data = await youtube(identity.sub, 'channels?part=id,snippet,status,brandingSettings,contentDetails&mine=true');
	return ok({ channel: data.items?.[0] || null });
}

module.exports = { mine };
