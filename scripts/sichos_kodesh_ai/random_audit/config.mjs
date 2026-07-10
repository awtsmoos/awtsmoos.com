// B"H
import path from 'node:path';

export const DOCUMENTS_DIR = '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/corpus-runs/current/documents';
export const REPORTS_DIR = '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/logs/quality-audit';

export function parseArguments(argv) {
	const values = Object.fromEntries(argv.slice(2).map(argument => {
		const [key, value = 'true'] = argument.replace(/^--/, '').split('=');
		return [key, value];
	}));
	return {
		samples: Math.max(1, Number(values.samples || 12)),
		paragraphs: Math.max(1, Number(values.paragraphs || 8)),
		seed: values.seed || new Date().toISOString().slice(0, 10),
		output: values.output || path.join(REPORTS_DIR, 'latest-random-audit')
	};
}
