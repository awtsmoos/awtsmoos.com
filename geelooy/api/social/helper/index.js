//B"H
//Blessed is He
//Boruch Hashem


/**
 * Main Awtsmoos helper index: thin barrel assembling the
 * index* sibling slices in the original export order.
 * Importers need no changes; the export surface is identical.
 */

module.exports = Object.assign({},
	require('./indexGeneral.js'),
	require('./indexMail.js'),
	require('./indexAlias.js'),
	require('./indexHeichel.js'),
	require('./indexSeries.js'),
	require('./indexPosts.js'),
	require('./indexComments.js'),
	require('./indexAliasPosts.js')
);
