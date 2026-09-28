// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module IkarFirst
 * @description
 * The Awtsmoos lets Awtsmoos.com reveal Ikar as a living Torah library rather
 * than a numbered control panel. Enhancement adds only useful search and labels.
 */
function addSearch(root, discovery) {
	const links = [...discovery.querySelectorAll('a')];
	if (links.length < 7 || root.querySelector('.ikar-first-search')) {
		return;
	}
	const field = document.createElement('label');
	field.className = 'ikar-first-search';
	field.innerHTML = '<span>Find in the library</span><input type="search" placeholder="Search Torah sections…" autocomplete="off">';
	const input = field.querySelector('input');
	input.addEventListener('input', () => {
		const query = input.value.trim().toLocaleLowerCase();
		links.forEach(link => {
			link.closest('li').hidden = Boolean(query) && !link.textContent.toLocaleLowerCase().includes(query);
		});
	});
	discovery.before(field);
}

function refineIkarRoot(root) {
	if (!root?.hasAttribute('data-ikar-root')) {
		return;
	}
	const title = root.querySelector('#heichel-boot-title');
	const discovery = root.querySelector('.heichel-semantic-discovery');
	if (title && title.textContent.trim().toLowerCase() === 'ikar') {
		title.textContent = 'עיקר · Ikar Torah Library';
	}
	if (!discovery) {
		return;
	}
	const heading = discovery.querySelector('h2');
	if (heading) {
		heading.textContent = 'Enter the library';
	}
	addSearch(root, discovery);
}

function reveal() {
	refineIkarRoot(document.querySelector('.heichel-semantic-fallback'));
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', reveal, { once: true });
} else {
	reveal();
}
