// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos gives the Awtsmoos.com evidence court a calm, readable vessel. */
export function diagnosticsStyles() {
	return `
		.awtsmoos-diagnostics-popover {
			position: fixed;
			top: 56px;
			left: 18px;
			z-index: 999999;
			width: min(430px, calc(100vw - 24px));
			max-height: 78vh;
			overflow: auto;
			border: 1px solid rgba(125, 211, 252, .38);
			border-radius: 16px;
			background: rgba(5, 12, 24, .96);
			color: #dff6ff;
			box-shadow: 0 24px 70px rgba(0, 0, 0, .45);
			padding: 12px;
		}
		.awtsmoos-diagnostics-popover header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 10px;
		}
		.awtsmoos-diagnostics-popover button {
			min-width: 44px;
			min-height: 44px;
			border: 0;
			border-radius: 999px;
			background: rgba(255, 255, 255, .12);
			color: inherit;
		}
		.awtsmoos-diagnostics-popover section {
			margin-top: 10px;
			padding: 9px;
			border: 1px solid rgba(125, 211, 252, .15);
			border-radius: 12px;
			background: rgba(14, 165, 233, .08);
		}
		.awtsmoos-diagnostics-popover h4 {
			margin: 0 0 4px;
			font-size: 12px;
			letter-spacing: .08em;
			text-transform: uppercase;
		}
		.awtsmoos-diagnostics-popover pre {
			margin: 0;
			white-space: pre-wrap;
			font: inherit;
			font-size: 12px;
			line-height: 1.4;
		}
	`;
}
