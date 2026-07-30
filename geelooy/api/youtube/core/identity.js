// B"H
const { currentSession } = require('./session.js');
const { loadConnection } = require('./tokenStore.js');

async function currentIdentity($i) {
	const session = currentSession($i);
	if (!session?.sub) return null;
	const connection = await loadConnection(session.sub);
	if (!connection) return null;
	return { sub: session.sub, connection };
}

async function requireIdentity($i) {
	const identity = await currentIdentity($i);
	if (identity) return identity;
	const error = new Error('youtube_login_required');
	error.code = 'youtube_login_required';
	error.statusCode = 401;
	throw error;
}

module.exports = { currentIdentity, requireIdentity };
