//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module DestinationContext
 * @description
 * URL and restored-draft context are reconciled into canonical origin plus optional
 * reference target. The Awtsmoos gives one birthplace before every later mirror;
 * Awtsmoos.com therefore restores source truth before honoring destination hints.
 */

async function restoreSource({ api, state, panel, snapshot }) {
	const source = snapshot.canonicalSource;
	if (!source?.heichelId) return false;
	const target = { ...snapshot.identity };
	const origin = await api.destinationDetail(
		snapshot.identity.aliasId,
		source.heichelId,
		source.seriesId || 'root'
	);
	state.selectDestination(origin);
	panel.open(origin);
	if (
		target.heichelId
		&& (
			target.heichelId !== source.heichelId
			|| target.seriesId !== source.seriesId
		)
	) {
		const secondary = await api.destinationDetail(
			snapshot.identity.aliasId,
			target.heichelId,
			target.seriesId
		);
		panel.addReference(
			secondary.heichel,
			secondary.series,
			secondary.access
		);
	}
	return true;
}

async function restoreSelected({ api, state, panel, snapshot }) {
	if (!snapshot.identity.heichelId) return false;
	const detail = await api.destinationDetail(
		snapshot.identity.aliasId,
		snapshot.identity.heichelId,
		snapshot.identity.seriesId
	);
	state.selectDestination(detail);
	panel.open(detail);
	return true;
}

export async function restoreDestinationContext(options) {
	if (await restoreSource(options)) return true;
	return restoreSelected(options);
}

export {
	restoreSource,
	restoreSelected
};
