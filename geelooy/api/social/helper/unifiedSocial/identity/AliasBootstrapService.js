//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AliasBootstrapService
 * @description
 * The composer awakens by discovering whether a private user session exists and
 * which public aliases it may honestly wear. The Awtsmoos creates the speaker,
 * the garment, and this verification anew, while Awtsmoos.com returns no secret.
 */

const nativeAliases = require('../../alias.js');
const { publicAlias, uniqueAliases, memoryContext } = require('./AliasContext.js');

function userIdFrom({ $i, userid }) {
	return String(
		userid
		|| $i?.request?.user?.info?.userId
		|| $i?.request?.user?.info?.userid
		|| $i?.request?.user?.userid
		|| ''
	);
}

function bodyInput($i, body) {
	return {
		...$i,
		$_POST: { ...($i.$_POST || {}), ...body }
	};
}

async function detailAliases({ $i, aliasIds }) {
	const aliases = [];
	for (const aliasId of aliasIds) {
		const detail = await nativeAliases.getAlias(aliasId, $i).catch(() => null);
		if (detail?.error) continue;
		aliases.push(publicAlias({ ...detail, aliasId }));
	}
	return uniqueAliases(aliases);
}

async function bootstrap({ $i, userid, preferredAlias = '' }) {
	const userId = userIdFrom({ $i, userid });
	if (!userId) {
		return {
			success: {
				loggedIn: false,
				aliases: [],
				defaultAlias: '',
				selectedAlias: '',
				requiresLogin: true
			}
		};
	}
	const ids = await nativeAliases.getAliasIDs({ $i, userID: userId });
	const aliasIds = Array.isArray(ids) ? ids.map(String) : Object.keys(ids || {});
	const aliases = await detailAliases({ $i, aliasIds });
	const defaultResult = await nativeAliases.getDefaultAlias({ $i, userid: userId });
	const defaultAlias = defaultResult?.success && typeof defaultResult.success === 'string'
		? defaultResult.success
		: '';
	const preferred = aliasIds.includes(preferredAlias) ? preferredAlias : '';
	const selectedAlias = preferred || (aliasIds.includes(defaultAlias) ? defaultAlias : '')
		|| aliases[0]?.aliasId
		|| '';
	return {
		success: {
			loggedIn: true,
			aliases,
			defaultAlias,
			selectedAlias,
			requiresAlias: aliases.length === 0,
			memory: selectedAlias
				? memoryContext(aliases.find(alias => alias.aliasId === selectedAlias), selectedAlias === defaultAlias)
				: null
		}
	};
}

async function createAlias({ $i, userid }) {
	const userId = userIdFrom({ $i, userid });
	if (!userId) return { error: { code: 'NO_LOGIN', message: 'Log in before creating an alias.' } };
	const result = await nativeAliases.createNewAlias({ $i, userid: userId });
	if (result?.error) return result;
	const aliasId = result?.success?.aliasId || result?.success?.id || result?.aliasId || '';
	const setAsDefault = ![false, 'false', 0, '0'].includes($i.$_POST?.setAsDefault);
	if (aliasId && setAsDefault) {
		await nativeAliases.setDefaultAlias({
			$i: bodyInput($i, { aliasId }),
			userid: userId
		});
	}
	return {
		...await bootstrap({ $i, userid: userId, preferredAlias: aliasId }),
		created: result?.success || result
	};
}

async function selectDefault({ $i, userid }) {
	const userId = userIdFrom({ $i, userid });
	if (!userId) return { error: { code: 'NO_LOGIN', message: 'Log in before selecting an alias.' } };
	const result = await nativeAliases.setDefaultAlias({ $i, userid: userId });
	if (result?.error) return result;
	return bootstrap({
		$i,
		userid: userId,
		preferredAlias: $i.$_POST?.aliasId || $i.$_POST?.alias || ''
	});
}

module.exports = {
	userIdFrom,
	bodyInput,
	bootstrap,
	createAlias,
	selectDefault
};
