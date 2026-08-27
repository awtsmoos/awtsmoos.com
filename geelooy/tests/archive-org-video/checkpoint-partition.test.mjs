//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { YouTubeArchiveCheckpoint } from '../../youtube/migrate/js/YouTubeArchiveCheckpoint.js';
import { SelectedMediaUploadCoordinator } from '../../social/migrate/js/upload/SelectedMediaUploadCoordinator.js';

class MemoryStorage {
	constructor() {
		this.value = '';
	}

	getItem() {
		return this.value || null;
	}

	setItem(key, value) {
		this.value = value;
	}

	removeItem() {
		this.value = '';
	}
}

test('YouTube checkpoint serializes public archive evidence but strips credentials and Files', () => {
	const storage = new MemoryStorage();
	const checkpoint = new YouTubeArchiveCheckpoint(storage);
	const saved = checkpoint.save({
		archived: {
			v1: {
				identifier: 'item',
				mediaUrl: 'https://archive.org/download/item/video.mp4',
				filename: 'video.mp4',
				mime: 'video/mp4',
				secretKey: 'NEVER',
				file: { name: 'video.mp4' }
			}
		},
		completed: { v1: true },
		secretKey: 'NEVER'
	});
	const serialized = JSON.stringify(saved);
	assert.equal(serialized.includes('NEVER'), false);
	assert.equal(serialized.includes('"file"'), false);
	assert.equal(saved.archived.v1.identifier, 'item');
});

test('selected-media coordinator partitions video away from native upload', () => {
	const coordinator = new SelectedMediaUploadCoordinator({
		nativeUploader: {},
		videoUploader: {},
		checkpoint: {}
	});
	const archive = {
		resolve(path) {
			return {
				'image.jpg': { kind: 'image' },
				'voice.mp3': { kind: 'audio' },
				'movie.mp4': { kind: 'video' }
			}[path];
		}
	};
	assert.deepEqual(coordinator.partition(archive, [
		'image.jpg',
		'voice.mp3',
		'movie.mp4'
	]), {
		nativePaths: ['image.jpg', 'voice.mp3'],
		videoPaths: ['movie.mp4']
	});
});
