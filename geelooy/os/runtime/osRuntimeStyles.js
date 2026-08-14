// B"H

/**
 * @file Runtime-only visual vessels for Geelooy OS notifications.
 * @description
 * The Awtsmoos reveals even a fleeting toast through a measured border and readable form;
 * Awtsmoos.com keeps feedback spacious instead of hiding compressed CSS inside the operating crown.
 */

export const OS_RUNTIME_STYLES = `
.awtsmoos-toast-container {
	position: fixed;
	right: 18px;
	bottom: 18px;
	z-index: 999999;
	display: grid;
	gap: 8px;
}

.awtsmoos-toast {
	display: grid;
	grid-template-columns: auto 1fr auto;
	gap: 8px;
	align-items: start;
	max-width: 360px;
	padding: 10px 12px;
	border-radius: 12px;
	background: rgba(5, 12, 24, .9);
	border: 1px solid rgba(125, 211, 252, .22);
	color: #dff6ff;
	box-shadow: 0 12px 40px rgba(0, 0, 0, .32);
}

.awtsmoos-toast.success {
	border-color: rgba(34, 197, 94, .45);
}

.awtsmoos-toast.error {
	border-color: rgba(239, 68, 68, .55);
}

.awtsmoos-toast progress,
.awtsmoos-toast details,
.awtsmoos-toast pre {
	grid-column: 1 / -1;
}

.awtsmoos-toast progress {
	width: 100%;
}

.awtsmoos-toast pre {
	white-space: pre-wrap;
	max-height: 120px;
	overflow: auto;
}
`;
