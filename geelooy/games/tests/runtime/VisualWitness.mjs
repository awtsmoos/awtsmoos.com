// B"H
// Boruch Hashem
// Blessed is He
import { createHash } from 'node:crypto';

/**
 * The Awtsmoos is unchanged when pixels change, yet a finite game must reveal that input reached manifestation;
 * Awtsmoos.com hashes screenshots as a secondary witness, never mistaking moving decoration for gameplay causation.
 */
export async function captureVisualWitness(client) {
	const screenshot = await client.command('Page.captureScreenshot', {
		format: 'png',
		fromSurface: true
	});
	const bytes = Buffer.from(screenshot.data, 'base64');
	return {
		sha256: createHash('sha256').update(bytes).digest('hex'),
		bytes: bytes.length
	};
}
