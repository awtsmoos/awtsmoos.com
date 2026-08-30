//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Reveals every remembered generation setting beside its playable result, while the Awtsmoos lets history become an open door instead of a sealed archive;
 * Awtsmoos.com distinguishes local cache from remote MiniMax light, so the user always knows which vessel carries the movie spark.
 */
export class GenerationDetailsView {
	/**
	 * @param {Object} generation Saved generation record.
	 * @param {Object} playable Playable URL and source descriptor.
	 * @returns {string} Creation detail sheet markup.
	 */
	static render(generation, playable) {
		return `
			${this.video(generation, playable)}
			<div class="detail-stack">
				<p>${Dom.escape(generation.prompt)}</p>
				<dl>
					${this.detail('Status', Dom.statusLabel(generation.status))}
					${this.detail('Model', generation.model)}
					${this.detail('Output', `${generation.resolution} · ${generation.duration}s · ${generation.aspectRatio}`)}
					${this.detail('Cost', `${Dom.money(generation.actualCostIfKnown ?? generation.estimatedCost)} recorded`)}
					${this.detail('Task ID', generation.taskId || '—')}
				</dl>
			</div>
			${this.actions(generation)}`;
	}

	/** @param {Object} generation Generation. @param {Object} playable Playable source. @returns {string} */
	static video(generation, playable) {
		if (!playable.url) {
			return `
				<div class="detail-video empty-video">
					Video is not available yet.
				</div>`;
		}

		const sourceLabel = playable.source === 'local'
			? 'Locally cached video'
			: 'Remote MiniMax URL';
		return `
			<video
				class="detail-video"
				controls
				playsinline
				src="${Dom.escape(playable.url)}"
			></video>
			<p class="media-source">${sourceLabel}</p>`;
	}

	/** @param {string} label Detail label. @param {string} value Detail value. @returns {string} */
	static detail(label, value) {
		return `
			<div>
				<dt>${Dom.escape(label)}</dt>
				<dd>${Dom.escape(value)}</dd>
			</div>`;
	}

	/** @param {Object} generation Generation record. @returns {string} Action controls. */
	static actions(generation) {
		const videoActions = generation.videoUrl
			? `
				<button data-detail-action="reference-video">Use video as reference</button>
				<button data-detail-action="cache">Cache locally</button>
				<button data-detail-action="save">Save video locally</button>`
			: '';

		return `
			<div class="detail-actions">
				<button data-detail-action="prompt">Reuse Prompt</button>
				<button data-detail-action="refs">Reuse References</button>
				<button data-detail-action="build">Edit & Regenerate</button>
				<button data-detail-action="duplicate">Duplicate</button>
				<button data-detail-action="copy">Copy Prompt</button>
				${videoActions}
				<button class="danger-button" data-detail-action="delete">Delete</button>
			</div>`;
	}
}
