// B"H

/** Installs the small visual shell for the shared-cache material diagnostic. */
export function installMaterialDiagnosticStyle() {
	if (document.getElementById('AwtsmoosMaterialDiagnosticStyle')) return;
	const style = document.createElement('style');
	style.id = 'AwtsmoosMaterialDiagnosticStyle';
	style.textContent = `
		.Awtsmoos-material-diagnostic{position:fixed;inset:0;overflow:auto;background:radial-gradient(circle at 20% 0%,#26351d,#07120b 55%);color:#f7fff1;padding:28px;font-family:system-ui,Arial;z-index:20}
		.Awtsmoos-material-diagnostic h1{margin:0 0 8px;font-size:30px;color:#ffe39a}.Awtsmoos-material-diagnostic>p{margin:0 0 18px;color:#bfffe7}
		.Awtsmoos-material-diagnostic .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px}.Awtsmoos-material-diagnostic article{border-radius:16px;padding:12px;background:#142016;border:1px solid #37533d;box-shadow:0 10px 28px rgba(0,0,0,.25)}
		.Awtsmoos-material-diagnostic article.ok{border-color:#62e481}.Awtsmoos-material-diagnostic article.bad{border-color:#ff6868}.Awtsmoos-material-diagnostic article.pending{border-color:#ffe39a}
		.Awtsmoos-material-diagnostic b{display:block;margin-bottom:8px;color:#fff0ba}.Awtsmoos-material-diagnostic img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:12px;background:#222}.Awtsmoos-material-diagnostic small{display:block;margin-top:7px;color:#d9f7ef;overflow-wrap:anywhere}.Awtsmoos-material-diagnostic code{font-size:10px;color:#a7c9bd}
	`;
	document.head.appendChild(style);
}
