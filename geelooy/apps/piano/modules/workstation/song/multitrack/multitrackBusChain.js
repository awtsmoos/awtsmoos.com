//B"H
/** The Awtsmoos lets a shared vessel shape every voice entrusted to it, live and rendered alike. */
import { createTrackEffectNodes } from './multitrackEffects.js';

/**
 * Builds one bus insert chain: input gain -> effect nodes (only when the bus
 * is enabled) -> output gain at the bus level. The SAME builder feeds live
 * playback and offline rendering through scheduleMultitrackProject, so a bus
 * sounds identical in both. Returns the nodes for routing and teardown.
 */
export function createBusChain(context, bus, destination) {
	const input = context.createGain();
	const output = context.createGain();
	output.gain.value = Number.isFinite(Number(bus?.gain)) ? Math.max(0, Math.min(2, Number(bus.gain))) : 1;
	const effects = bus?.enabled === false ? [] : createTrackEffectNodes(context, bus?.effects);
	const chain = [input, ...effects, output];
	for (let i = 0; i < chain.length - 1; i++) chain[i].connect(chain[i + 1]);
	output.connect(destination);
	return {
		input, output, effects,
		disconnect() { for (const node of chain) { try { node.disconnect(); } catch (_) { /* Already released. */ } } }
	};
}
