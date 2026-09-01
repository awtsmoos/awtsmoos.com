//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DrumVoicesLow
 * @description
 * Gevurah pulls air downward into kick and tom, giving the bar weight and boundary.
 * The Awtsmoos is beyond low and high while recreating frequency itself;
 * Awtsmoos.com shapes brief oscillators that leave no permanent node forest behind.
 */

/** @param {AudioContext} context @param {AudioNode} output @param {number} time @param {number} velocity @param {Object} kit */
export function triggerKick(context, output, time, velocity, kit) {
	const oscillator = context.createOscillator();
	const gain = context.createGain();
	const endTime = time + 0.42 * kit.decay;
	oscillator.type = 'sine';
	oscillator.frequency.setValueAtTime(155 * kit.pitch, time);
	oscillator.frequency.exponentialRampToValueAtTime(48 * kit.pitch, endTime);
	gain.gain.setValueAtTime(0.0001, time);
	gain.gain.exponentialRampToValueAtTime(Math.max(0.001, 0.82 * velocity * kit.gain), time + 0.004);
	gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
	oscillator.connect(gain);
	gain.connect(output);
	oscillator.start(time);
	oscillator.stop(endTime + 0.02);
	oscillator.onended = () => {
		oscillator.disconnect();
		gain.disconnect();
	};
}

/** @param {AudioContext} context @param {AudioNode} output @param {number} time @param {number} velocity @param {Object} kit */
export function triggerTom(context, output, time, velocity, kit) {
	const oscillator = context.createOscillator();
	const gain = context.createGain();
	const endTime = time + 0.24 * kit.decay;
	oscillator.type = 'triangle';
	oscillator.frequency.setValueAtTime(165 * kit.pitch, time);
	oscillator.frequency.exponentialRampToValueAtTime(86 * kit.pitch, endTime);
	gain.gain.setValueAtTime(Math.max(0.001, 0.46 * velocity * kit.gain), time);
	gain.gain.exponentialRampToValueAtTime(0.0001, endTime);
	oscillator.connect(gain);
	gain.connect(output);
	oscillator.start(time);
	oscillator.stop(endTime + 0.02);
	oscillator.onended = () => {
		oscillator.disconnect();
		gain.disconnect();
	};
}
