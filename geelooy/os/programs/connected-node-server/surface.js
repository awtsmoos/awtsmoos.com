//B"H
// Boruch Hashem
// Blessed is He

import {
	button,
	field,
	node,
	recipeDefaults,
	statusPanel,
	text
} from './surfaceElements.js';

/**
 * @module ConnectedNodeServerSurface
 * @description
 * The Awtsmoos lets machine, project, process, port, preview, and ledger appear as explicit controls;
 * Awtsmoos.com composes those smaller vessels around a secret-free recipe, while the live account-owned machine still comes only from current Tunnel testimony.
 */

export function createServerSurface(recipe = null) {
	const defaults = recipeDefaults(recipe);
	const root = node('main', 'connectedServer');
	const hero = node('section', 'connectedServer__hero');
	hero.append(
		text('p', 'connectedServer__kicker', 'B"H · Connected Compute'),
		text('h1', '', 'Node server. Your machine. Geelooy control plane.'),
		text(
			'p',
			'connectedServer__lead',
			'Start and supervise a Node.js project on an account-owned connected machine, expose its local port, inspect logs, and see server-authoritative Peruta usage without leaving Geelooy OS.'
		)
	);
	const form = node('form', 'connectedServer__form');
	form.id = 'connectedNodeServerForm';
	const device = field('Machine', 'select', 'serverDevice');
	const cwd = field('Project directory', 'input', 'serverCwd', {
		placeholder: '/Users/you/project',
		value: defaults.cwd
	});
	const entry = field('Node entry file', 'input', 'serverEntry', {
		placeholder: 'server.js',
		value: defaults.entry
	});
	const port = field('Local port', 'input', 'serverPort', {
		type: 'number',
		min: '1',
		max: '65535',
		value: String(defaults.port)
	});
	const args = field('Arguments as JSON array', 'input', 'serverArgs', {
		placeholder: '[]',
		value: JSON.stringify(defaults.args)
	});
	const start = button('Start server', 'serverStart', 'primary');
	form.append(device.wrap, cwd.wrap, entry.wrap, port.wrap, args.wrap, start);
	const lifecycle = statusPanel();
	const logs = node('section', 'connectedServer__logsPanel');
	logs.append(text('h2', '', 'Server logs'));
	const logOutput = text(
		'pre',
		'connectedServer__logs',
		'Start a server to stream stdout and stderr.'
	);
	logs.append(logOutput);
	const usage = node('section', 'connectedServer__usagePanel');
	usage.append(text('h2', '', 'Peruta usage'));
	const usageGrid = node('div', 'connectedServer__usageGrid');
	usage.append(usageGrid);
	const initialMessage = defaults.prefilled
		? 'Project runtime recipe loaded. Choose a live machine to start.'
		: 'Connected Node Server ready.';
	const message = text('p', 'connectedServer__message', initialMessage);
	message.setAttribute('role', 'status');
	root.append(hero, form, lifecycle.root, logs, usage, message);
	return Object.freeze({
		args: args.input,
		cwd: cwd.input,
		device: device.input,
		entry: entry.input,
		expose: lifecycle.expose,
		form,
		job: lifecycle.job,
		logOutput,
		message,
		port: port.input,
		preview: lifecycle.preview,
		refresh: lifecycle.refresh,
		root,
		start,
		status: lifecycle.status,
		stop: lifecycle.stop,
		usageGrid
	});
}
