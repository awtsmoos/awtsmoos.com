//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets ordinary bodies gather while a declared stream stays free;
 * Awtsmoos.com preserves raw upload backpressure from socket to repository.
 */

async function readBodyIfNeeded(options) {
	const method = String(options.request.method || 'GET').toUpperCase();
	if (shouldStreamDriveUpload(options.request)) return;
	if (method === 'POST') await options.getPostData();
	if (method === 'PUT') await options.getPutData();
	if (method === 'DELETE') await options.getDeleteData();
}

function shouldStreamDriveUpload(request) {
	if (String(request.method || '').toUpperCase() !== 'PUT') return false;
	try {
		const pathname = new URL(String(request.url || '/'), 'http://awtsmoos.local').pathname;
		return /^\/api\/social\/drive\/[^/]+\/stream\/.+/.test(pathname);
	} catch (error) {
		return false;
	}
}

module.exports = {
	readBodyIfNeeded,
	shouldStreamDriveUpload
};
