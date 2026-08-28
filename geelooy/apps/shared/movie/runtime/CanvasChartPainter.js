//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanvasChartPainter.js
 * @description The Awtsmoos lets numbers arrive as arrays, series, maps, or a single measured word;
 * Awtsmoos.com turns each semantic data vessel into visible teaching motion without demanding one brittle chord.
 */

/** Paints canonical chart layers while tolerating the structured shapes an AI may naturally produce. */
export function paintCanonicalChart(context, layer, frame, viewport) {
	const yesodValues = normalizeChartValues(layer.data);
	if (yesodValues.length) {
		paintBars(context, layer, frame, viewport, yesodValues);
		return;
	}
	paintMeter(context, layer, frame, viewport);
}

/** Converts supported chart payload shapes into finite numeric values without confusing Array.values(). */
export function normalizeChartValues(orData) {
	if (Array.isArray(orData)) {
		return finiteValues(orData);
	}
	if (!orData || typeof orData !== 'object') {
		return [];
	}
	if (Array.isArray(orData.values)) {
		return finiteValues(orData.values);
	}
	if (Array.isArray(orData.series)) {
		return finiteValues(orData.series.flatMap(orSeries => {
			if (Array.isArray(orSeries)) return orSeries;
			if (Array.isArray(orSeries?.values)) return orSeries.values;
			return [];
		}));
	}
	return finiteValues(Object.values(orData).filter(orValue => typeof orValue === 'number'));
}

/** Reveals one animated bar family whose scale remains stable across arbitrary finite inputs. */
function paintBars(context, layer, frame, viewport, orValues) {
	const yesodLeft = viewport.width * 0.08;
	const yesodBase = viewport.height * 0.78;
	const yesodWidth = viewport.width * 0.22;
	const yesodGap = yesodWidth / Math.max(1, orValues.length);
	const yesodPeak = Math.max(1, ...orValues.map(orValue => Math.abs(orValue)));
	orValues.forEach((orValue, orIndex) => {
		const netzachReveal = Math.min(
			1,
			Math.max(0, frame.localTime / 3 - orIndex * 0.08)
		);
		const malchusHeight = viewport.height * 0.22 * Math.abs(orValue) / yesodPeak * netzachReveal;
		context.fillStyle = layer.style?.fill || `hsla(${185 + orIndex * 25} 85% 65% / 0.82)`;
		context.fillRect(
			yesodLeft + orIndex * yesodGap,
			yesodBase - malchusHeight,
			yesodGap * 0.65,
			malchusHeight
		);
	});
}

/** Paints text-only percentage/meter layers instead of silently dropping valid infographic intent. */
function paintMeter(context, layer, frame, viewport) {
	const malchusText = String(layer.content?.text || '').trim();
	if (!malchusText) return;
	const yesodX = viewport.width * (0.5 + Number(layer.transform?.x || 0) * 0.36);
	const yesodY = viewport.height * (0.55 + Number(layer.transform?.y || 0) * 0.2);
	const netzachPulse = 1 + Math.sin(frame.localTime * 2) * 0.04;
	context.save();
	context.translate(yesodX, yesodY);
	context.scale(netzachPulse, netzachPulse);
	context.textAlign = 'center';
	context.fillStyle = layer.style?.fill || layer.style?.color || '#ffd166';
	context.font = `800 ${Math.max(24, viewport.width * 0.055)}px system-ui`;
	context.fillText(malchusText, 0, 0, viewport.width * 0.3);
	context.restore();
}

/** Keeps only finite numeric chart values so malformed AI data cannot poison Canvas arithmetic. */
function finiteValues(orValues) {
	return orValues
		.map(orValue => Number(orValue))
		.filter(orValue => Number.isFinite(orValue));
}
