//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Visual vessel for the Project Data Studio.
 * @description
 * The Awtsmoos lets structured data appear as a calm garden instead of a wall of raw machinery;
 * Awtsmoos.com keeps controls spacious and responsive while the project database boundary stays narrow and free.
 */

const THEME_ID = "geelooy-project-data-theme";
const CSS = `
.project-data-studio{margin:18px 0 0;padding:18px;border:1px solid var(--border,#cad3df);border-radius:18px;background:var(--panel,#fff)}
.project-data-head{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;margin-bottom:14px}.project-data-head h3{margin:0 0 4px;font-size:1.05rem}.project-data-head p{margin:0;max-width:68ch;opacity:.72}
.project-data-grid{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:10px}.project-data-field{display:grid;gap:5px;font-size:.78rem;font-weight:700}.project-data-field input,.project-data-editor{width:100%;box-sizing:border-box;border:1px solid var(--border,#cad3df);border-radius:10px;background:var(--input-bg,#fff);color:inherit;padding:9px 10px;font:inherit}
.project-data-editor{min-height:140px;resize:vertical;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.82rem;line-height:1.45;margin-top:10px}.project-data-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.project-data-actions button,.project-data-key{border:1px solid var(--border,#cad3df);background:var(--button-bg,#fff);color:inherit;border-radius:999px;padding:8px 12px;cursor:pointer}
.project-data-keys{display:flex;gap:7px;flex-wrap:wrap;min-height:34px;align-items:center}.project-data-key{font-size:.78rem}.project-data-status{min-height:1.4em;margin:10px 0 0;font-size:.8rem;opacity:.76}.project-data-status[data-tone="error"]{color:#b42318;opacity:1}.project-data-status[data-tone="success"]{color:#067647;opacity:1}
@media(max-width:900px){.project-data-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.project-data-studio{padding:14px}.project-data-grid{grid-template-columns:1fr}.project-data-actions button{flex:1 1 42%}}
`;

export function ensureProjectDataStudioTheme() {
	if (document.getElementById(THEME_ID)) return;
	const style = document.createElement("style");
	style.id = THEME_ID;
	style.textContent = CSS;
	document.head.append(style);
}
