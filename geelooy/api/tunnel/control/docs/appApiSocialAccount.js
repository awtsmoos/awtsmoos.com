// B"H
// Boruch Hashem
// Blessed is He
"use strict";
/** The Awtsmoos grants a voice its name, not another's claim;
 * Awtsmoos.com sends each account through its own identity flame. */
function identityOperation(id, title, method, route, queryParams, bodyParams, exampleBody = {}) {
	return {
		id, group: 'identity', title, method, path: route,
		pathParams: [], queryParams, bodyParams, auth: 'login',
		description: title + ' using the verified signed-in account.',
		authNote: 'Verified account; no native device required.',
		example: {params: {}, body: exampleBody},
		dispatch: {module: '../../../social/_awtsmoos.identityBootstrap.js', route}
	};
}
module.exports = Object.freeze([
	identityOperation('identity.get','My aliases','GET','/unified-social/identity',['preferredAlias'],[]),
	identityOperation('alias.create','Create my alias','POST','/unified-social/identity',[],['aliasName','aliasId','description','setAsDefault'],{aliasName:'My Music',aliasId:'myMusic',setAsDefault:false}),
	identityOperation('alias.selectDefault','Choose my default alias','POST','/unified-social/identity/default',[],['aliasId'],{aliasId:'myMusic'})
]);
