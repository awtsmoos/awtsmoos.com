//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ConnectedNodeServerSurfaceElements
 * @description
 * The Awtsmoos lets each small control hold one clear purpose while the larger server surface remains spacious and known;
 * Awtsmoos.com gathers fields, buttons, status, and recipe defaults as reusable vessels, so no cramped monolith must be grown.
 */

export function statusPanel() {
	const root = node('section', 'connectedServer__statusPanel');
	root.append(
		text('p', 'connectedServer__kicker', 'Live server'),
		text('h2', '', 'Process & preview')
	);
	const status = text('p', 'connectedServer__status', 'No server started yet.');
	const job = text('code', 'connectedServer__job', 'Job: —');
	const controls = node('div', 'connectedServer__controls');
	const refresh = button('Refresh', 'serverRefresh');
	const expose = button('Expose port', 'serverExpose');
	const stop = button('Stop', 'serverStop', 'danger');
	controls.append(refresh, expose, stop);
	const preview = node('a', 'connectedServer__preview');
	preview.textContent = 'No preview exposed';
	preview.hidden = true;
	preview.target = '_blank';
	preview.rel = 'noopener noreferrer';
	root.append(status, job, controls, preview);
	return { root, status, job, refresh, expose, stop, preview };
}

export function recipeDefaults(recipe) {
	return {
		cwd: String(recipe?.cwd || ''),
		entry: String(recipe?.entry || 'server.js'),
		port: Number(recipe?.port || 3000),
		args: Array.from(recipe?.args || []).map(String),
		prefilled: Boolean(recipe)
	};
}

export function field(labelText, tagName, id, attributes = {}) {
	const wrap = node('label', 'connectedServer__field');
	wrap.append(text('span', '', labelText));
	const input = node(tagName);
	input.id = id;
	for (const [key, value] of Object.entries(attributes)) {
		input.setAttribute(key, value);
	}
	wrap.append(input);
	return { input, wrap };
}

export function button(label, id, tone = 'secondary') {
	const value = text(
		'button',
		`connectedServer__button connectedServer__button--${tone}`,
		label
	);
	value.type = id === 'serverStart' ? 'submit' : 'button';
	value.id = id;
	return value;
}

export function node(tag, className = '') {
	const value = document.createElement(tag);
	value.className = className;
	return value;
}

export function text(tag, className, value) {
	const element = node(tag, className);
	element.textContent = value;
	return element;
}
