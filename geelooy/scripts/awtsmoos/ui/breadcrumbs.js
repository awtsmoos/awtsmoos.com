// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AwtsmoosBreadcrumbs
 * @description
 * Shared breadcrumb navigation for Awtsmoos inner pages.
 * Renders Home / Section / Page from the URL path. Mounts automatically
 * when included; safe to include on any page (skips the homepage and
 * pages that already have a breadcrumb).
 */

(function awtsmoosBreadcrumbs() {
	if (typeof document === 'undefined') return;

	var LABELS = {
		'': 'Home',
		'games': 'Games',
		'social-hub': 'Social Hub',
		'social': 'Social',
		'social-composer': 'Composer',
		'heichelos': 'Heichelos',
		'ikar': 'Torah Library',
		'mawgawl': 'Mawgawl',
		'sefarim': 'Living Library',
		'os': 'Awtsmoos OS',
		'email': 'Mail',
		'apps': 'Apps',
		'films': 'Films',
		'encyclopedia': 'Encyclopedia',
		'series': 'Series',
		'post': 'Post',
		'wallet': 'Wallet',
		'drive': 'Drive',
		'profile': 'Profile',
		'notifications': 'Notifications',
	};

	function humanize(segment) {
		if (Object.prototype.hasOwnProperty.call(LABELS, segment)) return LABELS[segment];
		return String(segment || '')
			.replace(/[-_]+/g, ' ')
			.replace(/\b\w/g, function (c) { return c.toUpperCase(); })
			.slice(0, 48) || 'Page';
	}

	function buildCrumbs() {
		var path = String(location.pathname || '/');
		var segments = path.split('/').filter(Boolean);
		if (!segments.length) return null; // homepage: no breadcrumb needed
		// Skip utility/asset paths.
		if (segments[0] === 'api' || segments[0] === 'scripts' || segments[0] === 'style') return null;
		// Heichel pages own their breadcrumb (ikar-first pill / Torah
		// navigation); the generic trail must never paint beside it
		// (batch 29 follow-up: it rendered a raw-URL second trail,
		// "Home / ... / Series / TheWrittenTorah", above the hero).
		if (segments[0] === 'heichelos') return null;

		var crumbs = [{ label: 'Home', href: '/' }];
		var href = '';
		for (var i = 0; i < segments.length; i++) {
			href += '/' + segments[i];
			var isLast = i === segments.length - 1;
			crumbs.push({
				label: humanize(segments[i]),
				href: isLast ? null : href + '/',
			});
		}
		// Keep it to Home / Section / Page (collapse deep paths).
		if (crumbs.length > 4) {
			crumbs = [crumbs[0], { label: '…', href: null }, crumbs[crumbs.length - 2], crumbs[crumbs.length - 1]];
		}
		return crumbs;
	}

	function render(crumbs) {
		var nav = document.createElement('nav');
		nav.className = 'awtsmoos-breadcrumbs';
		nav.setAttribute('aria-label', 'Breadcrumb');
		nav.style.cssText = [
			'font-size:0.85rem', 'padding:0.6rem 1.25rem', 'color:#6d5c40',
		].join(';');

		var list = document.createElement('ol');
		list.style.cssText = 'list-style:none;display:flex;flex-wrap:wrap;gap:0.35rem;margin:0;padding:0;align-items:center;';

		crumbs.forEach(function (crumb, index) {
			var item = document.createElement('li');
			item.style.cssText = 'display:flex;align-items:center;gap:0.35rem;';
			if (index > 0) {
				var sep = document.createElement('span');
				sep.textContent = '›';
				sep.setAttribute('aria-hidden', 'true');
				sep.style.opacity = '0.6';
				item.append(sep);
			}
			if (crumb.href) {
				var link = document.createElement('a');
				link.href = crumb.href;
				link.textContent = crumb.label;
				link.style.cssText = 'color:#8a6d3b;text-decoration:none;';
				item.append(link);
			} else {
				var current = document.createElement('span');
				current.textContent = crumb.label;
				current.setAttribute('aria-current', 'page');
				current.style.fontWeight = '600';
				item.append(current);
			}
			list.append(item);
		});

		nav.append(list);
		return nav;
	}

	function mount() {
		// Don't double-mount or fight an existing breadcrumb.
		if (document.querySelector('.awtsmoos-breadcrumbs, [aria-label="Breadcrumb"].breadcrumb, .breadcrumb')) return;
		var crumbs = buildCrumbs();
		if (!crumbs) return;
		var nav = render(crumbs);
		var main = document.querySelector('main');
		if (main && main.parentNode) {
			main.parentNode.insertBefore(nav, main);
		} else if (document.body) {
			document.body.insertBefore(nav, document.body.firstChild);
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', mount);
	} else {
		mount();
	}
})();
