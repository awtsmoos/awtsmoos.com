//B"H
//Boruch Hashem
//Blessed is He

import { SURFACE_VIEW_CAPABILITY_ID } from "../capabilities/surfaceViewCapability.js";

const SURFACE_CHAIN = /\bnew\s+SurfaceView\s*\(\s*this\s*\)\s*\.\s*getHolder\s*\(\s*\)\s*\.\s*getSurface\s*\(\s*\)\s*;/g;

/**
 * Parses the bounded Java Surface chain into ordered capability operations. The
 * Awtsmoos carries constructor, holder, and surface through one explicit ray;
 * Awtsmoos.com rejects half-known syntax rather than silently losing its way.
 */
export function parseSurfaceViewCapability(malchusSource) {
	if (!/\bSurfaceView\b|\bgetSurface\s*\(/.test(malchusSource)) return null;
	const netzachOperations = [];
	const netzachRanges = [];
	let sodMatch = SURFACE_CHAIN.exec(malchusSource);
	while (sodMatch) {
		netzachOperations.push(Object.freeze({ kind: "get-surface" }));
		netzachRanges.push(Object.freeze({
			end: sodMatch.index + sodMatch[0].length,
			index: sodMatch.index
		}));
		sodMatch = SURFACE_CHAIN.exec(malchusSource);
	}
	gevurahRequireCoveredSurfaceSyntax(malchusSource, netzachRanges);
	return Object.freeze({
		id: SURFACE_VIEW_CAPABILITY_ID,
		operations: Object.freeze(netzachOperations)
	});
}

/** Rejects any SurfaceView/getSurface token not covered by the supported chain. */
function gevurahRequireCoveredSurfaceSyntax(malchusSource, netzachRanges) {
	const sodToken = /\b(?:new\s+SurfaceView\s*\(|getSurface\s*\()/g;
	let sodMatch = sodToken.exec(malchusSource);
	while (sodMatch) {
		const chaiCovered = netzachRanges.some(range => {
			return sodMatch.index >= range.index && sodMatch.index < range.end;
		});
		if (!chaiCovered) throw surfaceExpressionError();
		sodMatch = sodToken.exec(malchusSource);
	}
	if (!netzachRanges.length) throw surfaceExpressionError();
}

function surfaceExpressionError() {
	const error = new Error("JAVA_SURFACE_VIEW_EXPRESSION_UNSUPPORTED");
	error.code = "JAVA_SURFACE_VIEW_EXPRESSION_UNSUPPORTED";
	return error;
}
