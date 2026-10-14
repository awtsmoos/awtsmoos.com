// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ApiDocs
 * @description
 * Yaakov 2026-10-14 (TRACK J): small behaviors for the developer API docs
 * page — copy-to-clipboard on code samples, scroll-spy for the sidebar,
 * and a light/dark theme toggle persisted like the rest of the site.
 *
 * Yaakov's rules honored: no !important (styling is in apiDocs.css).
 */

function currentTheme() {
	return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function setTheme(next) {
	document.documentElement.setAttribute('data-theme', next);
	try { localStorage.setItem('awtsmoos-theme', next); } catch (_) {}
	const btn = document.getElementById('api-theme-btn');
	if (btn) btn.textContent = next === 'light' ? 'Dark' : 'Light';
}

function initCopyButtons() {
	document.querySelectorAll('[data-api-code]').forEach(block => {
		const btn = block.querySelector('[data-api-copy]');
		const code = block.querySelector('code');
		if (!btn || !code) return;
		btn.addEventListener('click', async () => {
			const text = code.innerText;
			try {
				await navigator.clipboard.writeText(text);
			} catch (_) {
				const ta = document.createElement('textarea');
				ta.value = text;
				document.body.append(ta);
				ta.select();
				try { document.execCommand('copy'); } catch (_) {}
				ta.remove();
			}
			const prev = btn.textContent;
			btn.textContent = 'Copied';
			btn.classList.add('is-copied');
			setTimeout(() => {
				btn.textContent = prev;
				btn.classList.remove('is-copied');
			}, 1400);
		});
	});
}

function initScrollSpy() {
	const links = [...document.querySelectorAll('[data-api-nav]')];
	if (!links.length || !('IntersectionObserver' in window)) return;
	const sections = links
		.map(a => document.querySelector(a.getAttribute('href')))
		.filter(Boolean);
	const io = new IntersectionObserver((entries) => {
		for (const e of entries) {
			if (!e.isIntersecting) continue;
			links.forEach(a => a.classList.toggle('is-active',
				a.getAttribute('href') === '#' + e.target.id));
		}
	}, { rootMargin: '-20% 0px -70% 0px' });
	sections.forEach(s => io.observe(s));
}

export function initApiDocs() {
	initCopyButtons();
	initScrollSpy();
	const themeBtn = document.getElementById('api-theme-btn');
	if (themeBtn) {
		themeBtn.textContent = currentTheme() === 'light' ? 'Dark' : 'Light';
		themeBtn.addEventListener('click', () => {
			setTheme(currentTheme() === 'light' ? 'dark' : 'light');
		});
	}
}
