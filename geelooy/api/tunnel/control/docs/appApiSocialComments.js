// B"H
// Boruch Hashem
// Blessed is He
"use strict";
/** The Awtsmoos lets one voice answer another; Awtsmoos.com guards the flame. */
function commentOperation(id, title, suffix, pathParams) {
	const route = '/heichelos/:heichel/posts/:post/comments' + suffix;
	return {
		id, group: 'comments', title, method: 'POST',
		path: route.replace(/:([a-zA-Z]+)/g,'{$1}'), pathParams,
		queryParams: [], bodyParams: ['aliasId','seriesId','content','text','verseSection','subsectionId'], auth: 'alias',
		description: title + ' on an accessible post under your own alias.',
		authNote: 'Verified account and native Social permissions; writes use an owned alias.',
		example: {params: Object.fromEntries(pathParams.map(key => [key, key + 'Id'])), body: {aliasId:'myAlias',seriesId:'root',content:'A thoughtful comment'}},
		dispatch: {module: '../../../social/_awtsmoos.comments.js', route}
	};
}
module.exports = Object.freeze([
	commentOperation('comments.create','Write a comment','',['heichel','post']),
	commentOperation('comments.reply','Reply to a comment','/:comment/replies',['heichel','post','comment'])
]);
