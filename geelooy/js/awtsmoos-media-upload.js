//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosMediaUpload
 * @description Universal media upload component for Awtsmoos.
 * One tap to upload, one tap to attach. Dead simple.
 *
 * Supports: images (JPG, PNG, WebP, GIF), audio (MP3, WAV, M4A),
 *           video (MP4, WebM), documents (PDF)
 *
 * Uploads to the user's Awtsmoos Drive via the streaming API,
 * returns a public URL for embedding.
 *
 * Usage:
 *   const uploader = new AwtsmoosMediaUpload({
 *     onUpload: (result) => console.log(result.publicUrl),
 *     onProgress: (pct) => console.log(pct + '%'),
 *     onError: (err) => console.error(err)
 *   });
 *   uploader.attachTo(document.getElementById('my-dropzone'));
 *   // Or trigger programmatically:
 *   uploader.pickFiles();
 */

(function(global) {
	'use strict';

	const API_BASE = '/api/social';
	const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
	const IMAGE_MAX_DIMENSION = 2048; // Compress images larger than this

	const ACCEPTED_TYPES = {
		'image/jpeg': 'image',
		'image/png': 'image',
		'image/webp': 'image',
		'image/gif': 'image',
		'audio/mpeg': 'audio',
		'audio/mp3': 'audio',
		'audio/wav': 'audio',
		'audio/x-wav': 'audio',
		'audio/m4a': 'audio',
		'audio/x-m4a': 'audio',
		'video/mp4': 'video',
		'video/webm': 'video',
		'application/pdf': 'document'
	};

	const ACCEPT_ATTR = Object.keys(ACCEPTED_TYPES).join(',');

	class AwtsmoosMediaUpload {
		constructor(options = {}) {
			this.onUpload = options.onUpload || (() => {});
			this.onProgress = options.onProgress || (() => {});
			this.onError = options.onError || (() => {});
			this.onPreview = options.onPreview || (() => {});
			this.aliasId = options.aliasId || null; // If null, will fetch default alias
			this.uploadPath = options.uploadPath || 'uploads/media';
			this.visibility = options.visibility || 'public';
			this.multiple = options.multiple !== false;
			this.maxFiles = options.maxFiles || 10;

			this._input = null;
			this._dropzones = [];
			this._uploading = new Set();
		}

		/**
		 * Get the user's default alias ID for uploads.
		 */
		async _getAliasId() {
			if (this.aliasId) return this.aliasId;
			try {
				const res = await fetch(`${API_BASE}/alias/default`, { credentials: 'include' });
				if (res.ok) {
					const data = await res.json();
					this.aliasId = data.aliasId || data.id || 'me';
					return this.aliasId;
				}
			} catch (e) { /* fall through */ }
			// Fallback: try to get from profile
			try {
				const res = await fetch(`${API_BASE}/me`, { credentials: 'include' });
				if (res.ok) {
					const data = await res.json();
					this.aliasId = data.defaultAlias || data.aliasId || 'me';
					return this.aliasId;
				}
			} catch (e) { /* fall through */ }
			this.aliasId = 'me';
			return this.aliasId;
		}

		/**
		 * Attach drag-and-drop + click-to-upload to an element.
		 */
		attachTo(element, options = {}) {
			if (!element) return;
			element.classList.add('amu-dropzone');

			// Click to pick files
			element.addEventListener('click', (e) => {
				// Don't trigger if clicking on a child button/link
				if (e.target.closest('button, a, input')) return;
				this.pickFiles();
			});

			// Drag and drop
			element.addEventListener('dragover', (e) => {
				e.preventDefault();
				e.stopPropagation();
				element.classList.add('amu-dragover');
			});
			element.addEventListener('dragleave', (e) => {
				e.preventDefault();
				e.stopPropagation();
				element.classList.remove('amu-dragover');
			});
			element.addEventListener('drop', (e) => {
				e.preventDefault();
				e.stopPropagation();
				element.classList.remove('amu-dragover');
				if (e.dataTransfer.files.length) {
					this.handleFiles(e.dataTransfer.files);
				}
			});

			this._dropzones.push(element);

			// Add hint text if empty
			if (!element.querySelector('.amu-hint') && options.showHint !== false) {
				const hint = document.createElement('div');
				hint.className = 'amu-hint';
				hint.innerHTML = '<span class="amu-hint-icon">📎</span><span>Tap to upload or drag files here</span>';
				element.appendChild(hint);
			}
		}

		/**
		 * Open the file picker programmatically.
		 */
		pickFiles() {
			if (!this._input) {
				this._input = document.createElement('input');
				this._input.type = 'file';
				this._input.accept = ACCEPT_ATTR;
				this._input.multiple = this.multiple;
				this._input.style.display = 'none';
				document.body.appendChild(this._input);
				this._input.addEventListener('change', () => {
					if (this._input.files.length) {
						this.handleFiles(this._input.files);
					}
					this._input.value = ''; // Reset for re-selection
				});
			}
			this._input.click();
		}

		/**
		 * Validate and process selected files.
		 */
		async handleFiles(fileList) {
			const files = Array.from(fileList).slice(0, this.maxFiles);
			for (const file of files) {
				const validation = this._validateFile(file);
				if (!validation.valid) {
					this.onError(new Error(validation.message), file);
					continue;
				}
				// Show preview immediately
				this.onPreview(file, this._createPreviewUrl(file));
				// Upload
				try {
					const result = await this.uploadFile(file);
					this.onUpload(result, file);
				} catch (err) {
					this.onError(err, file);
				}
			}
		}

		_validateFile(file) {
			if (file.size > MAX_FILE_SIZE) {
				return { valid: false, message: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` };
			}
			const type = ACCEPTED_TYPES[file.type];
			if (!type) {
				// Try by extension as fallback
				const ext = file.name.split('.').pop().toLowerCase();
				const extMap = { jpg: 1, jpeg: 1, png: 1, webp: 1, gif: 1, mp3: 1, wav: 1, m4a: 1, mp4: 1, webm: 1, pdf: 1 };
				if (!extMap[ext]) {
					return { valid: false, message: `File type not supported: ${file.type || ext}` };
				}
			}
			return { valid: true };
		}

		_createPreviewUrl(file) {
			try { return URL.createObjectURL(file); } catch (e) { return null; }
		}

		_getMediaType(file) {
			return ACCEPTED_TYPES[file.type] || 'document';
		}

		/**
		 * Compress image if larger than max dimension.
		 * Returns the (possibly compressed) File/Blob.
		 */
		async _compressImageIfNeeded(file) {
			if (!file.type.startsWith('image/') || file.type === 'image/gif') {
				return file; // Don't compress GIFs (would break animation)
			}
			return new Promise((resolve) => {
				const img = new Image();
				const url = URL.createObjectURL(file);
				img.onload = () => {
					URL.revokeObjectURL(url);
					const { width, height } = img;
					if (width <= IMAGE_MAX_DIMENSION && height <= IMAGE_MAX_DIMENSION) {
						resolve(file); // No compression needed
						return;
					}
					// Calculate new dimensions
					const scale = IMAGE_MAX_DIMENSION / Math.max(width, height);
					const newW = Math.round(width * scale);
					const newH = Math.round(height * scale);

					const canvas = document.createElement('canvas');
					canvas.width = newW;
					canvas.height = newH;
					const ctx = canvas.getContext('2d');
					ctx.drawImage(img, 0, 0, newW, newH);

					canvas.toBlob((blob) => {
						if (blob) {
							// Preserve original filename but note compression
							const compressed = new File([blob], file.name, { type: file.type });
							resolve(compressed);
						} else {
							resolve(file);
						}
					}, file.type, 0.85);
				};
				img.onerror = () => {
					URL.revokeObjectURL(url);
					resolve(file);
				};
				img.src = url;
			});
		}

		/**
		 * Upload a single file to Awtsmoos Drive.
		 * Returns { publicUrl, path, fileName, mediaType, size }.
		 */
		async uploadFile(file) {
			const aliasId = await this._getAliasId();
			const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

			// Compress images if needed
			const fileToUpload = await this._compressImageIfNeeded(file);
			const mediaType = this._getMediaType(file);

			// Build Drive path: uploads/media/{type}/{timestamp}-{filename}
			const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
			const drivePath = `${this.uploadPath}/${mediaType}/${uploadId}-${safeName}`;
			const publicUrl = `${API_BASE}/drive/public/${encodeURIComponent(aliasId)}/${drivePath}`;

			this._uploading.add(uploadId);

			return new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				const url = `${API_BASE}/drive/${encodeURIComponent(aliasId)}/stream/${drivePath.split('/').map(encodeURIComponent).join('/')}`;

				xhr.open('PUT', url);
				xhr.withCredentials = true;

				// Required headers for streaming upload
				xhr.setRequestHeader('Content-Type', fileToUpload.type || 'application/octet-stream');
				xhr.setRequestHeader('x-drive-mime', fileToUpload.type || 'application/octet-stream');
				xhr.setRequestHeader('x-drive-visibility', this.visibility);
				xhr.setRequestHeader('x-drive-cache-policy', 'public');
				xhr.setRequestHeader('idempotency-key', uploadId);
				xhr.setRequestHeader('x-request-id', uploadId);

				xhr.upload.addEventListener('progress', (e) => {
					if (e.lengthComputable) {
						const pct = Math.round((e.loaded / e.total) * 100);
						this.onProgress(pct, file, uploadId);
					}
				});

				xhr.addEventListener('load', () => {
					this._uploading.delete(uploadId);
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve({
							publicUrl,
							drivePath,
							fileName: file.name,
							mediaType,
							size: fileToUpload.size,
							mimeType: fileToUpload.type
						});
					} else {
						let msg = `Upload failed (HTTP ${xhr.status})`;
						try {
							const body = JSON.parse(xhr.responseText);
							msg = body.error?.message || body.message || msg;
						} catch (e) { /* use default */ }
						reject(new Error(msg));
					}
				});

				xhr.addEventListener('error', () => {
					this._uploading.delete(uploadId);
					reject(new Error('Upload network failed'));
				});

				xhr.addEventListener('abort', () => {
					this._uploading.delete(uploadId);
					reject(new Error('Upload cancelled'));
				});

				xhr.send(fileToUpload);
			});
		}

		/**
		 * Check if any uploads are in progress.
		 */
		isUploading() {
			return this._uploading.size > 0;
		}
	}

	// Export
	global.AwtsmoosMediaUpload = AwtsmoosMediaUpload;

	/**
	 * Convenience: create an upload button that triggers file picker.
	 * Returns the button element.
	 */
	global.createUploadButton = function(options = {}) {
		const uploader = new AwtsmoosMediaUpload(options);
		const btn = document.createElement('button');
		btn.type = 'button';
		btn.className = 'amu-upload-btn ' + (options.className || '');
		btn.innerHTML = options.label || '<span class="amu-btn-icon">📎</span><span>Upload</span>';
		btn.setAttribute('aria-label', options.ariaLabel || 'Upload media');
		btn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			uploader.pickFiles();
		});
		btn._uploader = uploader;
		return btn;
	};

})(typeof window !== 'undefined' ? window : this);
