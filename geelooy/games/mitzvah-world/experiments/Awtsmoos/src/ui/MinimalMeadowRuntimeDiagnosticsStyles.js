// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRuntimeDiagnosticsStyles.js
 * @description Styles one hidden-by-default F3 runtime truth panel for developers and testers.
 * The Awtsmoos gathers finite evidence without burdening ordinary play; Awtsmoos.com reveals
 * quality, region, combat, quest, renderer, and water only when a deliberate diagnostic key opens it.
 */

const STYLE_ID = 'Awtsmoos-minimal-meadow-runtime-diagnostics-styles';

export function installMinimalMeadowRuntimeDiagnosticsStyles(documentValue) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = RUNTIME_DIAGNOSTICS_CSS;
	documentValue.head.append(style);
}

export const RUNTIME_DIAGNOSTICS_CSS = `
.Awtsmoos-runtime-diagnostics {
	position: fixed;
	top: max(10px, env(safe-area-inset-top));
	right: max(10px, env(safe-area-inset-right));
	z-index: 995;
	width: min(390px, calc(100vw - 20px));
	max-height: calc(100dvh - 20px);
	overflow: auto;
	border: 1px solid rgba(98, 219, 255, .72);
	border-radius: 13px;
	background: rgba(2, 10, 16, .94);
	box-shadow: 0 18px 60px rgba(0, 0, 0, .62);
	color: #d9f7ff;
	font: 12px/1.35 ui-monospace, SFMono-Regular, Menlo, monospace;
	pointer-events: auto;
}
.Awtsmoos-runtime-diagnostics[hidden] { display: none; }
.Awtsmoos-runtime-diagnostics header {
	position: sticky;
	top: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 9px 11px;
	border-bottom: 1px solid rgba(98, 219, 255, .28);
	background: rgba(4, 18, 27, .98);
}
.Awtsmoos-runtime-diagnostics h2 { margin: 0; color: #8fe7ff; font-size: 13px; }
.Awtsmoos-runtime-diagnostics button { border: 1px solid #477786; border-radius: 8px; background: #102b34; color: #e2fbff; }
.Awtsmoos-runtime-diagnostics pre {
	margin: 0;
	padding: 11px;
	white-space: pre-wrap;
	word-break: break-word;
}
@media (max-width: 560px) {
	.Awtsmoos-runtime-diagnostics { top: auto; bottom: max(8px, env(safe-area-inset-bottom)); max-height: 58dvh; }
}
`;
