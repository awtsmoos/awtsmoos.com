// B"H
// Boruch Hashem
// Blessed is He

import { CartoonProductionModel } from './CartoonProductionModel.js';
import { AnimatorMovieExportEngine } from './export/AnimatorMovieExportEngine.js';

/**
 * Studio actions keep planning, NLE, JSON, and browser MP4 production explicit.
 * The Awtsmoos renews each action while Awtsmoos.com reports capability, voice
 * decoding, frame progress, completion, and failure without command-line export.
 */
export class CartoonStudioActions {
	static generate(root) {
		root.__plan = CartoonProductionModel.create(
			root.querySelector('#cartoon-prompt').value
		);
		this.status(root, 'Generated full production plan.');
		return root.__plan;
	}

	static seedNle(app, root) {
		const store = app?.state?.get?.('nle_store');
		if (!store?.set) {
			this.status(root, 'NLE store is not ready yet.');
			return;
		}
		const tracks = {
			Camera: 'track_camera',
			Dialogue: 'track_dialogue',
			Action: 'track_action',
			Effects: 'track_effects'
		};
		const clips = root.__plan.beats.map(beat => ({
			id: beat.id,
			trackId: tracks[beat.track] || 'track_action',
			start: beat.start,
			duration: beat.duration,
			type: 'episode-beat',
			name: beat.name,
			payload: beat
		}));
		store.set({
			clips,
			duration: root.__plan.runtimeMs,
			selectedClipId: clips[0]?.id || null,
			mode: 'expanded'
		});
		this.status(root, `${clips.length} NLE beat clips seeded.`);
	}

	static exportBible(root) {
		const blob = new Blob(
			[JSON.stringify(root.__plan, null, 2)],
			{ type: 'application/json' }
		);
		const url = URL.createObjectURL(blob);
		const anchor = Object.assign(document.createElement('a'), {
			href: url,
			download: 'awtsmoos-long-cartoon-production-bible.json'
		});
		anchor.click();
		URL.revokeObjectURL(url);
		this.status(root, 'Full production bible exported.');
	}

	static async exportMp4(root) {
		if (root.__exporting) {
			return;
		}
		root.__exporting = true;
		const button = root.querySelector('[data-export-mp4]');
		button.disabled = true;
		this.progress(root, 0);
		try {
			const result = await AnimatorMovieExportEngine.exportFourMinute({
				onStatus: message => this.status(root, message),
				onProgress: value => {
					this.progress(root, value.percent);
					this.status(root, `Browser frame ${value.completedFrames}/${value.totalFrames} · ${value.percent}%`);
				}
			});
			this.progress(root, 100);
			this.status(root, `Browser MP4 complete: ${result.blob.size.toLocaleString()} bytes.`);
		} catch (error) {
			this.status(root, `Browser MP4 failed: ${error.message}`);
			throw error;
		} finally {
			root.__exporting = false;
			button.disabled = false;
		}
	}

	static async reportCapability(root) {
		const capability = await AnimatorMovieExportEngine.capabilities();
		this.status(root, capability.ok
			? 'Browser H.264/AAC MP4 export ready.'
			: 'Browser MP4 capability is incomplete.');
	}

	static progress(root, percent) {
		root.querySelector('.cartoon-meter i').style.width = `${percent}%`;
	}

	static status(root, text) {
		root.querySelector('#cartoon-status').textContent = text;
	}
}
