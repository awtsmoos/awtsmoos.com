//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosMediaKit
 * @description One-line integration for the full Awtsmoos media system.
 * Loads upload component, audio player, and lightbox with golden styling.
 *
 * Usage in any page:
 *   <script src="/js/awtsmoos-media-kit.js"></script>
 *   <script>
 *     // Upload button in a post composer:
 *     const btn = AwtsmoosMediaKit.uploadButton({
 *       onUpload: (result) => insertIntoPost(result.publicUrl, result.mediaType)
 *     });
 *     document.getElementById('composer-actions').appendChild(btn);
 *
 *     // Profile picture upload:
 *     AwtsmoosMediaKit.profilePictureUpload({
 *       currentUrl: user.avatarUrl,
 *       onUpload: (url) => saveAvatar(url)
 *     });
 *   </script>
 */

(function(global) {
	'use strict';

	const BASE = ''; // Same origin; paths are absolute from root

	const SCRIPTS = [
		'/js/awtsmoos-media-upload.js',
		'/js/awtsmoos-audio-player.js',
		'/js/awtsmoos-lightbox.js'
	];
	const STYLES = [
		'/css/awtsmoos-media-upload.css',
		'/css/awtsmoos-audio-player.css'
	];

	let _loaded = false;
	let _loadPromise = null;

	function loadStyles() {
		for (const href of STYLES) {
			if (document.querySelector(`link[href="${href}"]`)) continue;
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = href;
			document.head.appendChild(link);
		}
	}

	function loadScripts() {
		const promises = SCRIPTS.map(src => {
			if (document.querySelector(`script[src="${src}"]`)) return Promise.resolve();
			return new Promise((resolve, reject) => {
				const s = document.createElement('script');
				s.src = src;
				s.onload = resolve;
				s.onerror = () => reject(new Error(`Failed to load ${src}`));
				document.head.appendChild(s);
			});
		});
		return Promise.all(promises);
	}

	/**
	 * Ensure the media kit is loaded. Returns a promise.
	 */
	function ready() {
		if (_loaded) return Promise.resolve();
		if (_loadPromise) return _loadPromise;
		_loadPromise = (async () => {
			loadStyles();
			await loadScripts();
			_loaded = true;
		})();
		return _loadPromise;
	}

	/**
	 * Create an upload button. See AwtsmoosMediaUpload options.
	 */
	function uploadButton(options = {}) {
		if (!global.createUploadButton) {
			throw new Error('Media kit not loaded yet. Call AwtsmoosMediaKit.ready() first.');
		}
		return global.createUploadButton(options);
	}

	/**
	 * Create a full uploader instance. See AwtsmoosMediaUpload.
	 */
	function createUploader(options = {}) {
		if (!global.AwtsmoosMediaUpload) {
			throw new Error('Media kit not loaded yet. Call AwtsmoosMediaKit.ready() first.');
		}
		return new global.AwtsmoosMediaUpload(options);
	}

	/**
	 * Render an audio player for a URL. Returns the player element.
	 */
	function audioPlayer(src, title) {
		const div = document.createElement('div');
		if (global.AwtsmoosAudioPlayer) {
			new global.AwtsmoosAudioPlayer(div, { src, title });
		} else {
			// Fallback: native audio
			div.innerHTML = `<audio controls src="${src}" style="width:100%"></audio>`;
		}
		return div;
	}

	/**
	 * Render media embed HTML for a post/comment.
	 * Returns an HTML string for image, audio, video, or document.
	 */
	function embedHtml(result) {
		const url = result.publicUrl || result.url;
		const type = result.mediaType || 'document';
		const name = (result.fileName || 'file').replace(/</g, '&lt;');

		switch (type) {
			case 'image':
				return `<div class="amk-embed amk-embed-image awtsmoos-lightbox">` +
					`<img src="${url}" alt="${name}" class="awtsmoos-lightbox-img" loading="lazy"></div>`;
			case 'audio':
				return `<div class="amk-embed amk-embed-audio">` +
					`<audio class="awtsmoos-audio" src="${url}" data-title="${name}" preload="metadata"></audio></div>`;
			case 'video':
				return `<div class="amk-embed amk-embed-video">` +
					`<video src="${url}" controls preload="metadata" playsinline style="width:100%;border-radius:12px;max-height:400px"></video></div>`;
			default:
				return `<div class="amk-embed amk-embed-doc">` +
					`<a href="${url}" target="_blank" rel="noopener" class="amk-doc-link">` +
					`<span class="amk-doc-icon">📄</span><span>${name}</span></a></div>`;
		}
	}

	/**
	 * Profile/alias picture upload dialog.
	 * Shows current picture, upload button, preview, save/cancel.
	 */
	function pictureUploadDialog(options = {}) {
		const {
			title = 'Upload picture',
			currentUrl = null,
			aspectHint = 'Square images work best',
			onSave = () => {},
			onCancel = () => {}
		} = options;

		const overlay = document.createElement('div');
		overlay.className = 'amk-dialog-overlay';
		overlay.innerHTML = `
			<div class="amk-dialog" role="dialog" aria-modal="true" aria-label="${title}">
				<h3 class="amk-dialog-title">${title}</h3>
				<div class="amk-dialog-preview">
					${currentUrl ? `<img src="${currentUrl}" alt="Current">` : '<div class="amk-dialog-empty">No picture yet</div>'}
				</div>
				<p class="amk-dialog-hint">${aspectHint}</p>
				<div class="amk-dialog-progress" style="display:none">
					<div class="amu-progress-wrap"><div class="amu-progress-bar"></div></div>
					<div class="amu-progress-label">Uploading…</div>
				</div>
				<div class="amk-dialog-actions">
					<button type="button" class="amk-btn amk-btn-primary amk-btn-pick">Choose image</button>
					<button type="button" class="amk-btn amk-btn-save" disabled>Save</button>
					<button type="button" class="amk-btn amk-btn-cancel">Cancel</button>
				</div>
			</div>
		`;
		document.body.appendChild(overlay);

		let uploadedUrl = null;
		const uploader = createUploader({
			uploadPath: 'uploads/avatars',
			onProgress: (pct) => {
				const bar = overlay.querySelector('.amu-progress-bar');
				const label = overlay.querySelector('.amu-progress-label');
				overlay.querySelector('.amk-dialog-progress').style.display = '';
				if (bar) bar.style.width = pct + '%';
				if (label) label.textContent = `Uploading… ${pct}%`;
			},
			onUpload: (result) => {
				uploadedUrl = result.publicUrl;
				const preview = overlay.querySelector('.amk-dialog-preview');
				preview.innerHTML = `<img src="${result.publicUrl}" alt="New picture">`;
				overlay.querySelector('.amk-btn-save').disabled = false;
				overlay.querySelector('.amk-dialog-progress').style.display = 'none';
			},
			onError: (err) => {
				alert('Upload failed: ' + err.message);
				overlay.querySelector('.amk-dialog-progress').style.display = 'none';
			}
		});

		overlay.querySelector('.amk-btn-pick').addEventListener('click', () => uploader.pickFiles());
		overlay.querySelector('.amk-btn-cancel').addEventListener('click', () => {
			overlay.remove();
			onCancel();
		});
		overlay.querySelector('.amk-btn-save').addEventListener('click', () => {
			overlay.remove();
			if (uploadedUrl) onSave(uploadedUrl);
		});
		// Click backdrop to cancel
		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) { overlay.remove(); onCancel(); }
		});

		return overlay;
	}

	// Inject dialog styles
	function injectDialogStyles() {
		if (document.getElementById('amk-dialog-styles')) return;
		const s = document.createElement('style');
		s.id = 'amk-dialog-styles';
		s.textContent = `
			.amk-dialog-overlay {
				position: fixed; inset: 0; z-index: 99999;
				background: rgba(20, 14, 6, 0.6);
				display: flex; align-items: center; justify-content: center;
				padding: 1rem; backdrop-filter: blur(3px);
			}
			.amk-dialog {
				background: #fffdf8; border-radius: 18px; padding: 1.5rem;
				max-width: 380px; width: 100%;
				border: 1.5px solid rgba(184,134,11,0.25);
				box-shadow: 0 12px 48px rgba(0,0,0,0.25);
			}
			.amk-dialog-title { margin: 0 0 1rem; font-size: 1.15rem; color: #4a3517; text-align: center; }
			.amk-dialog-preview {
				width: 160px; height: 160px; margin: 0 auto 0.75rem;
				border-radius: 50%; overflow: hidden;
				border: 3px solid rgba(184,134,11,0.35);
				background: #f5f0e6; display: flex; align-items: center; justify-content: center;
			}
			.amk-dialog-preview img { width: 100%; height: 100%; object-fit: cover; }
			.amk-dialog-empty { color: #a89060; font-size: 0.85rem; text-align: center; padding: 1rem; }
			.amk-dialog-hint { text-align: center; color: #8a7355; font-size: 0.8rem; margin: 0 0 1rem; }
			.amk-dialog-actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
			.amk-btn {
				padding: 0.6rem 1.1rem; border-radius: 999px; font-weight: 600; font-size: 0.9rem;
				cursor: pointer; border: 1.5px solid transparent; touch-action: manipulation;
				-webkit-tap-highlight-color: transparent;
			}
			.amk-btn-primary { background: linear-gradient(135deg,#d4a017,#b8860b); color: white; border: none; }
			.amk-btn-save { background: #2d6a2d; color: white; border: none; }
			.amk-btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
			.amk-btn-cancel { background: transparent; color: #8a7355; border-color: rgba(184,134,11,0.3); }
			.amk-embed { margin: 0.5rem 0; }
			.amk-embed-image img { max-width: 100%; border-radius: 12px; display: block; }
			.amk-doc-link {
				display: inline-flex; align-items: center; gap: 0.5rem;
				padding: 0.6rem 1rem; border-radius: 10px;
				background: rgba(184,134,11,0.08); border: 1px solid rgba(184,134,11,0.25);
				color: #7a5c1e; text-decoration: none; font-weight: 600;
			}
			.amk-doc-link:hover { background: rgba(184,134,11,0.14); }
		`;
		document.head.appendChild(s);
	}
	injectDialogStyles();

	global.AwtsmoosMediaKit = {
		ready,
		uploadButton,
		createUploader,
		audioPlayer,
		embedHtml,
		pictureUploadDialog,
		isReady: () => _loaded
	};

})(typeof window !== 'undefined' ? window : this);
