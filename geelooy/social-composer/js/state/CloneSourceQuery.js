//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CloneSourceQuery
 * @description The Awtsmoos lets a source be remembered without becoming the new owner's destination;
 * Awtsmoos.com reads owned-copy intent through separate clone coordinates so reference and copy never blur in relation.
 */
import { firstQueryValue, safeQueryValue } from './ComposerQuery.js';

export function cloneSourceFromQuery(parameters) {
	const id = safeQueryValue(firstQueryValue(parameters, 'clone', 'cloneId'));
	if (!id) return null;
	return {
		type: safeQueryValue(parameters.get('cloneType') || 'post', 40),
		id,
		heichelId: safeQueryValue(firstQueryValue(parameters, 'cloneHeichel', 'cloneHeichelId')),
		seriesId: safeQueryValue(firstQueryValue(parameters, 'cloneSeries', 'cloneSeriesId') || 'root'),
		aliasId: safeQueryValue(firstQueryValue(parameters, 'cloneAlias', 'cloneAuthor'))
	};
}
