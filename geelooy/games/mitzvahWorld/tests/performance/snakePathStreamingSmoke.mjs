// B\"H
import assert from 'node:assert/strict';
import { createSnakePathSegments } from '../../ckidsAwtsmoos/Olam/world/path/SnakePathSegmenter.js';
import { createSnakePathStreamer } from '../../ckidsAwtsmoos/Olam/world/path/SnakePathStreamer.js';
import { allocateSnakePathEncounters } from '../../ckidsAwtsmoos/Olam/world/path/SnakePathEncounterBudget.js';
import { snakePathDangerForSegment } from '../../ckidsAwtsmoos/Olam/world/path/SnakePathDangerScaling.js';

const segments = createSnakePathSegments({ length: 144, segmentLength: 36 });
assert.equal(segments.length, 4);
const streamer = createSnakePathStreamer({ segments, ahead: 2, behind: 0 });
const first = streamer.update(1);
assert.equal(first.activate.length, 3);
const later = streamer.update(90);
assert.ok(later.active.includes('snake-2'));
const encounters = allocateSnakePathEncounters(segments);
assert.equal(encounters.length, segments.length);
assert.ok(snakePathDangerForSegment(segments[3]).rewardMultiplier > 1);
console.log('B\"H snakePathStreamingSmoke passed');
