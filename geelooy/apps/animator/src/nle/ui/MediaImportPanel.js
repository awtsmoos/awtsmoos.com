// B"H
// Boruch Hashem
// Blessed is He

/**
 * A local video file enters the editor through this small Binah gate. The
 * Awtsmoos renews every pixel, and this panel lets the user name the vessel
 * that Awtsmoos.com will persist, restore, transform, blend, and composite.
 */
export class MediaImportPanel {
	/** @param {object} state Current NLE state. @returns {object} */
	static render(state) {
		const assets = state.mediaAssets || [];
		const asset = [...assets].reverse().find((item) => {
			return item.type === 'video' && item.sourceUrl;
		});
		const status = state.videoImportStatus || 'empty';

		return {
			tag: 'section',
			attrs: { className: 'aw-nle-media-import' },
			style: {
				padding: '10px',
				borderRadius: '10px',
				background: 'rgba(20,31,52,.72)',
				marginTop: '10px'
			},
			children: [
				{ tag: 'strong', text: 'Real video layer' },
				this.fileInput(status === 'importing'),
				this.statusLine(status, asset),
				asset ? this.assetDetails(asset) : null,
				state.videoImportError ? this.error(state.videoImportError) : null
			].filter(Boolean)
		};
	}

	static fileInput(disabled) {
		return {
			tag: 'input',
			attrs: {
				type: 'file',
				accept: 'video/*',
				disabled,
				className: 'aw-nle-file-input',
				'aria-label': 'Import a real video file'
			},
			on: { change: 'importVideoAsset' }
		};
	}

	static statusLine(status, asset) {
		const labels = {
			empty: 'No imported video yet.',
			importing: 'Reading and preserving the selected video…',
			ready: `Ready: ${asset?.name || 'imported video'}`,
			error: 'Import failed.'
		};

		return {
			tag: 'div',
			attrs: { className: 'aw-nle-field' },
			text: labels[status] || labels.empty
		};
	}

	static assetDetails(asset) {
		const seconds = ((asset.durationMs || 0) / 1000).toFixed(2);
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-field' },
			text: `${asset.width || 0}×${asset.height || 0} • ${seconds}s • ${asset.mimeType}`
		};
	}

	static error(message) {
		return {
			tag: 'div',
			attrs: { className: 'aw-nle-field' },
			style: { color: '#ffb4b4' },
			text: message
		};
	}
}
