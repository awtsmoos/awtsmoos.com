//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RichSocialSchemaTest
 * @description
 * These witnesses prove that expressive blocks, media, questions, verses, and
 * subsections remain bounded and addressable while unsafe schemes and markup are
 * refused entry into the Awtsmoos.com social vessel.
 */

const assert = require('assert');
const {
	normalizeDocument,
	documentToText,
	normalizeAttachments,
	normalizeRichPost,
	validateRichPost,
	buildDiscussionTargets
} = require('../index.js');

function testSafeDocument() {
	const document = normalizeDocument({ blocks: [{
		id: 'opening',
		type: 'heading',
		text: '<script>alert(1)</script>',
		segments: [{
			text: 'Read safely',
			marks: [
				{ type: 'bold' },
				{ type: 'link', href: 'javascript:alert(1)' },
				{ type: 'link', href: 'https://awtsmoos.com/path' }
			]
		}]
	}] });
	assert.equal(document.blocks[0].text.includes('<'), false);
	assert.equal(document.blocks[0].segments[0].marks.length, 2);
	assert.match(documentToText(document), /Read safely/);
}

function testAttachments() {
	const attachments = normalizeAttachments([
		{ id: 'image-1', mime: 'image/png', publicPath: '/media/image.png' },
		{ id: 'audio-1', mime: 'audio/mpeg', publicPath: '/media/audio.mp3' },
		{ id: 'bad', publicPath: 'javascript:alert(1)' }
	]);
	assert.equal(attachments.length, 3);
	assert.equal(attachments[0].type, 'image');
	assert.equal(attachments[1].type, 'audio');
	assert.equal(attachments[2].publicPath, '');
}

function testQuestionAndSections() {
	const question = normalizeRichPost({
		aliasId: 'author',
		heichelId: 'study',
		postKind: 'question',
		title: 'What does this verse reveal?',
		rootDocument: [{ type: 'paragraph', text: 'A real question.' }],
		questionOptions: {
			answerPolicy: 'onePerAlias',
			answerGuidance: 'Bring a source.'
		},
		sections: [{
			id: 'verse-one',
			title: 'Verse One',
			document: [{ type: 'quote', text: 'The cited verse.' }],
			subsections: [{ id: 'word-one', title: 'First word', text: 'A detail.' }]
		}]
	});
	assert.equal(question.type, 'question');
	assert.equal(question.options.question.answerPolicy, 'onePerAlias');
	assert.equal(question.sections[0].options.richDocument.version, 1);
	assert.equal(validateRichPost(question).valid, true);
	const targets = buildDiscussionTargets({
		...question,
		id: 'question-1',
		postId: 'question-1'
	});
	assert.deepEqual(targets.targets.map(target => target.scope), [
		'post',
		'verse',
		'subsection'
	]);
}

testSafeDocument();
testAttachments();
testQuestionAndSections();
console.log('B"H richSocial schema.test passed');
