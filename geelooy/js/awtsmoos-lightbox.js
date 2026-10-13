//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module AwtsmoosLightbox
 * @description Full-screen image lightbox. Tap any image to view full-size.
 * Supports pinch-zoom (via native), swipe to close, keyboard nav.
 *
 * Usage:
 *   // Auto-enhance all images with .awtsmoos-lightbox-img:
 *   AwtsmoosLightbox.enhanceAll();
 *
 *   // Or open programmatically:
 *   AwtsmoosLightbox.open('https://.../image.jpg', 'Caption text');
 */

(function(global) {
	'use strict';

	let _overlay = null;
	let _img = null;
	let _caption = null;
	let _isOpen = false;

	function _build() {
		if (_overlay) return;

		_overlay = document.createElement('div');
		_overlay.className = 'alb-overlay';
		_overlay.setAttribute('role', 'dialog');
		_overlay.setAttribute('aria-modal', 'true');
		_overlay.setAttribute('aria-label', 'Image viewer');
		_overlay.innerHTML = `
			<div class="alb-backdrop"></div>
			<button type="button" class="alb-close" aria-label="Close">
				<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
					<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
				</svg>
			</button>
			<div class="alb-content">
				<img class="alb-image" alt="">
			</div>
			<div class="alb-caption"></div>
		`;
		document.body.appendChild(_overlay);

		_img = _overlay.querySelector('.alb-image');
		_caption = _overlay.querySelector('.alb-caption');

		// Close handlers
		_overlay.querySelector('.alb-close').addEventListener('click', close);
		_overlay.querySelector('.alb-backdrop').addEventListener('click', close);

		// Swipe down to close (touch)
		let touchStartY = 0;
		_overlay.addEventListener('touchstart', (e) => {
			touchStartY = e.touches[0].clientY;
		}, { passive: true });
		_overlay.addEventListener('touchend', (e) => {
			const dy = e.changedTouches[0].clientY - touchStartY;
			if (dy > 100) close(); // Swipe down
		}, { passive: true });

		// Keyboard
		document.addEventListener('keydown', (e) => {
			if (_isOpen && (e.key === 'Escape' || e.key === 'q')) close();
		});
	}

	function open(src, captionText) {
		_build();
		_img.src = src;
		_img.alt = captionText || 'Full-size image';
		_caption.textContent = captionText || '';
		_caption.style.display = captionText ? '' : 'none';
		_overlay.classList.add('alb-open');
		document.body.style.overflow = 'hidden';
		_isOpen = true;
	}

	function close() {
		if (!_overlay) return;
		_overlay.classList.remove('alb-open');
		document.body.style.overflow = '';
		_isOpen = false;
		// Clear src after transition to free memory
		setTimeout(() => { if (!_isOpen) _img.src = ''; }, 300);
	}

	function isOpen() { return _isOpen; }

	/**
	 * Auto-enhance images. Any <img> with class "awtsmoos-lightbox-img"
	 * or inside a container with "awtsmoos-lightbox" becomes tappable.
	 */
	function enhanceAll(root = document) {
		_build();
		const selector = 'img.awtsmoos-lightbox-img, .awtsmoos-lightbox img';
		root.querySelectorAll(selector).forEach(img => {
			if (img.hasAttribute('data-alb-bound')) return;
			img.setAttribute('data-alb-bound', 'true');
			img.style.cursor = 'zoom-in';
			img.setAttribute('tabindex', '0');
			img.setAttribute('role', 'button');
			const handler = (e) => {
				e.preventDefault();
				e.stopPropagation();
				// Use full-size URL if data-fullsrc is set, else current src
				const fullSrc = img.getAttribute('data-fullsrc') || img.currentSrc || img.src;
				const cap = img.getAttribute('alt') || img.getAttribute('data-caption') || '';
				open(fullSrc, cap);
			};
			img.addEventListener('click', handler);
			img.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') handler(e);
			});
		});
	}

	// Inject styles
	function _injectStyles() {
		if (document.getElementById('alb-styles')) return;
		const style = document.createElement('style');
		style.id = 'alb-styles';
		style.textContent = `
			.alb-overlay {
				position: fixed; inset: 0; z-index: 100000;
				display: flex; align-items: center; justify-content: center;
				opacity: 0; pointer-events: none;
				transition: opacity 0.25s ease;
			}
			.alb-overlay.alb-open { opacity: 1; pointer-events: auto; }
			.alb-backdrop {
				position: absolute; inset: 0;
				background: rgba(10, 8, 4, 0.92);
				backdrop-filter: blur(4px);
			}
			.alb-content {
				position: relative; z-index: 1;
				max-width: 94vw; max-height: 88vh;
				display: flex; align-items: center; justify-content: center;
			}
			.alb-image {
				max-width: 94vw; max-height: 88vh;
				object-fit: contain; border-radius: 8px;
				box-shadow: 0 8px 48px rgba(0,0,0,0.5);
			}
			.alb-close {
				position: absolute; top: max(12px, env(safe-area-inset-top)); right: 12px; z-index: 2;
				width: 44px; height: 44px; border-radius: 50%;
				background: rgba(255,255,255,0.12); color: white; border: none;
				display: flex; align-items: center; justify-content: center;
				cursor: pointer; touch-action: manipulation;
				-webkit-tap-highlight-color: transparent;
			}
			.alb-close:hover { background: rgba(255,255,255,0.22); }
			.alb-close:active { transform: scale(0.92); }
			.alb-caption {
				position: absolute; bottom: max(16px, env(safe-area-inset-bottom));
				left: 50%; transform: translateX(-50%); z-index: 2;
				color: rgba(255,255,255,0.85); font-size: 0.9rem;
				background: rgba(0,0,0,0.5); padding: 0.4rem 1rem;
				border-radius: 999px; max-width: 90vw;
				white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
			}
		`;
		document.head.appendChild(style);
	}

	_injectStyles();

	global.AwtsmoosLightbox = { open, close, isOpen, enhanceAll };

	// Auto-enhance on DOM ready + observe for dynamically added images
	function _init() {
		enhanceAll();
		// Watch for new images (e.g., in feeds, comments)
		if (typeof MutationObserver !== 'undefined') {
			const obs = new MutationObserver((mutations) => {
				for (const m of mutations) {
					for (const node of m.addedNodes) {
						if (node.nodeType === 1) { // Element
							if (node.matches && node.matches('img.awtsmoos-lightbox-img, .awtsmoos-lightbox img')) {
								enhanceAll(node.parentNode || document);
							} else if (node.querySelectorAll) {
								enhanceAll(node);
							}
						}
					}
				}
			});
			obs.observe(document.body, { childList: true, subtree: true });
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', _init);
	} else {
		_init();
	}

})(typeof window !== 'undefined' ? window : this);
