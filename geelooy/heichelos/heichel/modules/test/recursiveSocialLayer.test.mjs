// B"H
import assert from 'node:assert/strict';
import { normalizeSections, sectionById } from '../social/sectionedContent.js';
import { createAudioNote, audioNoteKey } from '../social/audioNotes.js';
import { createReplyEdge, groupReplyEdges } from '../social/replyDag.js';
import { rankFeedItems } from '../social/semanticFeedRanker.js';
import { createModerationMarker, markerTouchesSection } from '../social/sectionModeration.js';

const sections = normalizeSections([{ title: 'Gate', content: 'Open' }, { id: 's2', text: 'Deep' }]);
assert.equal(sections.length, 2);
assert.equal(sectionById(sections, 's2').text, 'Deep');

const note = createAudioNote({ target: { entityId: 'p1', sectionId: 's2' }, audioId: 'a1', start: 3, end: 9 });
assert.equal(audioNoteKey(note), 'a1:3:9');
assert.equal(note.target.sectionId, 's2');

const edge = createReplyEdge({ from: { entityType: 'comment', entityId: 'c2' }, to: { entityType: 'post', entityId: 'p1', sectionId: 's2' } });
const grouped = groupReplyEdges([edge]);
assert.equal([...grouped.values()][0][0].from.entityId, 'c2');

const ranked = rankFeedItems([{ id: 'old', semanticScore: 0.2 }, { id: 'deep', semanticScore: 0.9 }]);
assert.equal(ranked[0].id, 'deep');

const marker = createModerationMarker({ target: { entityId: 'p1', sectionId: 's2' }, reason: 'review claim' });
assert.equal(markerTouchesSection(marker, 's2'), true);

console.log('B"H recursiveSocialLayer.test passed');
