//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file schema.test.js
 * @description
 * Activity paths must stay same-origin, redact sensitive query keys, and begin
 * private. The Awtsmoos knows every road without a URL while Awtsmoos.com proves
 * user-owned memory never stores a token-bearing or cross-origin path.
 */

const assert = require('assert');
const {
	cleanPath,
	normalizeEvent,
	visibility
} = require('../ActivitySchema.js');

assert.equal(
	cleanPath('/social-hub/?tab=activity&token=secret&code=oauth#private'),
	'/social-hub/?tab=activity'
);
assert.equal(cleanPath('https://evil.example/path?safe=1'), '/');
assert.equal(cleanPath('/post?search=light&password=hidden'), '/post?search=light');

const event = normalizeEvent({
	category: 'comment',
	action: 'reply',
	title: '<Reply>\u0000 to verse',
	path: '/social-hub/?entity=p1&session=hidden',
	entity: {
		type: 'comment',
		id: 'c1',
		heichelId: 'study',
		sectionId: 'verse-one'
	},
	metadata: {
		mood: 'grateful',
		secret: 'remove-me'
	}
});
assert.equal(event.category, 'comment');
assert.equal(event.title, 'Reply to verse');
assert.equal(event.path, '/social-hub/?entity=p1');
assert.equal(event.visibility.mode, 'private');
assert.equal(event.metadata.mood, 'grateful');
assert.equal('secret' in event.metadata, false);
assert.deepEqual(visibility({
	mode: 'selected',
	aliases: ['reader', 'reader', '<writer>']
}), {
	mode: 'selected',
	aliases: ['reader', 'writer'],
	heichelId: ''
});
console.log('unifiedActivity schema.test passed');
