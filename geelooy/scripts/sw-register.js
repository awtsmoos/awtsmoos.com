// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sw-register.js — Service Worker auto-registration
 * @description
 * Registers the Awtsmoos service worker and checks for updates.
 * Include this script on every page (or inline the registration).
 *
 * Yaakov's law: users NEVER hard-refresh. The SW ensures fresh HTML
 * on every navigation, and hashed assets are cached immutably.
 */

(function() {
	if (!('serviceWorker' in navigator)) return;

	// Register the service worker
	navigator.serviceWorker.register('/sw.js', { scope: '/' })
		.then((registration) => {
			// Check for updates on every page load
			registration.update();

			// If a new SW is waiting, activate it immediately
			if (registration.waiting) {
				registration.waiting.postMessage({ type: 'SKIP_WAITING' });
			}

			// Listen for new SW installations
			registration.addEventListener('updatefound', () => {
				const newWorker = registration.installing;
				if (!newWorker) return;
				newWorker.addEventListener('statechange', () => {
					if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
						// New version available — show toast or auto-reload
						showUpdateToast(() => {
							newWorker.postMessage({ type: 'SKIP_WAITING' });
							window.location.reload();
						});
					}
				});
			});
		})
		.catch(() => {
			// SW registration failed — not critical, page still works
		});

	// Auto-reload when the SW takes control (new version activated)
	// B"H 2026-10-13: Yaakov — tapping a game card was refreshing the page
	// instead of navigating. Root cause: controllerchange fired mid-navigation
	// and location.reload() cancelled the user's tap. Never reload while the
	// user is navigating away or actively interacting.
	let refreshing = false;
	let userNavigating = false;
	// Mark navigation intent: any link tap or form submit means "don't reload me"
	document.addEventListener('click', (event) => {
		if (event.target && event.target.closest && event.target.closest('a[href], button[type="submit"]')) {
			userNavigating = true;
		}
	}, true);
	window.addEventListener('beforeunload', () => { userNavigating = true; });
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		if (refreshing || userNavigating) return;
		// Only reload if the page is visible and the user is idle (no recent interaction)
		if (document.visibilityState !== 'visible') return;
		refreshing = true;
		window.location.reload();
	});

	function showUpdateToast(onUpdate) {
		// Create a subtle "New version available" toast
		const toast = document.createElement('div');
		toast.setAttribute('role', 'status');
		toast.style.cssText = [
			'position:fixed', 'bottom:1rem', 'left:50%', 'transform:translateX(-50%)',
			'background:#1a1a2e', 'color:#ffd700', 'padding:0.75rem 1.25rem',
			'border-radius:2rem', 'font-size:0.875rem', 'z-index:999999',
			'box-shadow:0 4px 20px rgba(0,0,0,0.3)', 'cursor:pointer',
			'border:1px solid rgba(255,215,0,0.3)', 'font-family:system-ui'
		].join(';');
		toast.textContent = '✨ New version available — tap to update';
		toast.addEventListener('click', () => {
			toast.remove();
			onUpdate();
		});
		document.body.appendChild(toast);

		// Auto-update after 10 seconds if user doesn't tap
		setTimeout(() => {
			if (document.body.contains(toast)) {
				toast.remove();
				onUpdate();
			}
		}, 10000);
	}
})();
