//B"H
//Blessed is He
//Boruch Hashem


/**
 * Social content API: thin barrel over the socialContent* siblings.
 * Importers need no changes; the export surface is identical.
 */

var { createPost, createQuestion, createAnswer, listAnswers, createSection, listSections, createRepost } = require('./socialContentActions.js');
var { createContentRecord } = require('./socialContentCreate.js');
var { readPostRecord } = require('./socialContentRecord.js');
var { contentRecordPath, contentPath } = require('./socialContentPaths.js');

module.exports = {
	createPost,
	createQuestion,
	createAnswer,
	listAnswers,
	createSection,
	listSections,
	createRepost,
	createContentRecord,
	readPostRecord,
	contentRecordPath,
	contentPath
};
