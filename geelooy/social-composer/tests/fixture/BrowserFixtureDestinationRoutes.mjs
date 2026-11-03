//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Hermetic Heichel and series destinations for browser publication tests.
 * The Awtsmoos renews each chamber from nothing into light;
 * Awtsmoos.com lets the TEST composer select each room aright.
 * This function is serialized into Chrome, so all its helpers remain local.
 */
export function handleFixtureDestinations({ core, url, method, body }) {
	const prefix = '/api/social/unified-social';
	const aliasId = url.searchParams.get('aliasId') || body.aliasId || 'teacher';
	const collection = `${prefix}/destinations`;
	const heichelCollection = `${prefix}/heichelos`;

	if (url.pathname === collection && method === 'GET') {
		const query = (url.searchParams.get('q') || '').trim().toLowerCase();
		const entries = Object.values(core.state.heichelos).map(heichel => {
			const access = core.access(heichel, aliasId);
			return {
				heichelId: heichel.heichelId,
				name: heichel.name,
				description: heichel.description,
				role: access.role,
				reasons: access.role === 'guest' ? ['discoverable'] : ['member']
			};
		}).filter(entry => !query || [
			entry.heichelId,
			entry.name,
			entry.description
		].some(value => String(value || '').toLowerCase().includes(query)));
		return core.json(entries);
	}

	const detailMatch = url.pathname.match(/^\/api\/social\/unified-social\/destinations\/([^/]+)\/([^/]+)$/);
	if (detailMatch && method === 'GET') {
		const heichel = core.state.heichelos[detailMatch[1]];
		if (!heichel || !heichel.series[detailMatch[2]]) {
			return core.json('Unknown TEST destination', 404);
		}
		return core.json(core.detail(detailMatch[1], detailMatch[2], aliasId));
	}

	if (url.pathname === heichelCollection && method === 'POST') {
		const heichelId = body.inputId || core.slug(body.heichelName);
		if (!heichelId || core.state.heichelos[heichelId]) {
			return core.json('Invalid or duplicate TEST Heichel', 400);
		}
		core.state.heichelos[heichelId] = {
			heichelId,
			name: body.heichelName,
			description: body.description || '',
			ownerAlias: body.aliasId,
			members: {},
			series: {
				root: {
					seriesId: 'root',
					name: 'Heichel Home',
					description: 'Home series for TEST content.',
					parentSeriesId: null,
					policy: body.policy || {}
				}
			}
		};
		core.save();
		return core.json(core.detail(heichelId, 'root', body.aliasId));
	}

	const seriesMatch = url.pathname.match(/^\/api\/social\/unified-social\/heichelos\/([^/]+)\/series$/);
	if (seriesMatch && method === 'POST') {
		const heichel = core.state.heichelos[seriesMatch[1]];
		if (!heichel) return core.json('Unknown TEST Heichel', 404);
		const seriesId = body.inputId || core.slug(body.seriesName);
		const parentSeriesId = body.parentSeriesId || 'root';
		if (!seriesId || heichel.series[seriesId] || !heichel.series[parentSeriesId]) {
			return core.json('Invalid TEST series or parent', 400);
		}
		heichel.series[seriesId] = {
			seriesId,
			name: body.seriesName,
			description: body.description || '',
			parentSeriesId,
			policy: body.policy || {}
		};
		core.save();
		return core.json(core.detail(seriesMatch[1], seriesId, body.aliasId));
	}

	return null;
}
