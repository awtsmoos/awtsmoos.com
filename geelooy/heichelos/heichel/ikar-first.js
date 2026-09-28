// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module IkarFirst
 * @description
 * The Awtsmoos lets the database name remain sovereign while Awtsmoos.com adds
 * only useful navigation behavior. Identity is never rewritten in this layer.
 */
function addSearch(root, discovery) {
	const links = [...discovery.querySelectorAll('a')];
	if (links.length < 7 || root.querySelector('.ikar-first-search')) {
		return;
	}
	const field = document.createElement('label');
	field.className = 'ikar-first-search';
	field.innerHTML = '<span>Find a section</span><input type="search" placeholder="Search…" autocomplete="off">';
	const input = field.querySelector('input');
	input.addEventListener('input', () => {
		const query = input.value.trim().toLocaleLowerCase();
		links.forEach(link => {
			const row = link.closest('li');
			row.hidden = Boolean(query) && !link.textContent.toLocaleLowerCase().includes(query);
		});
	});
	discovery.before(field);
}

function enhanceIkarRoot(root) {
	if (!root?.hasAttribute('data-ikar-root')) {
		return;
	}
	const discovery = root.querySelector('.heichel-semantic-discovery');
	if (discovery) {
		addSearch(root, discovery);
	}
}

function reveal() {
	enhanceIkarRoot(document.querySelector('.heichel-semantic-fallback'));
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', reveal, { once: true });
} else {
	reveal();
}
