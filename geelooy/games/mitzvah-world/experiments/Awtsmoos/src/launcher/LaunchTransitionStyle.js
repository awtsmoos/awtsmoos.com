// B"H
// Boruch Hashem
// Blessed is He

/** Installs the compact world-entry vessel without enlarging the initial page stylesheet. */
export function installLaunchTransitionStyle(documentValue = globalThis.document) {
	if (!documentValue || documentValue.getElementById('AwtsmoosLaunchTransitionStyle')) return;
	const style = documentValue.createElement('style');
	style.id = 'AwtsmoosLaunchTransitionStyle';
	style.textContent = `
		.Awtsmoos-launch{min-height:calc(100vh - 54px);display:grid;place-content:center;gap:12px;padding:24px;text-align:center;background:radial-gradient(circle at 50% 30%,rgba(61,160,111,.17),transparent 42%)}
		.Awtsmoos-launch-mark{font-size:13px;font-weight:900;letter-spacing:.18em;color:#f5cf72}.Awtsmoos-launch h2{margin:0;font-size:clamp(22px,4vw,38px)}
		.Awtsmoos-launch p{max-width:560px;margin:0 auto;color:#c9e8dc;font-size:13px;line-height:1.5}.Awtsmoos-launch-track{width:min(520px,78vw);height:8px;margin:4px auto;overflow:hidden;border:1px solid rgba(135,255,194,.35);border-radius:99px;background:rgba(0,0,0,.28)}
		.Awtsmoos-launch-fill{height:100%;width:8%;border-radius:inherit;background:linear-gradient(90deg,#54d691,#f5cf72);transition:width .22s ease}.Awtsmoos-launch-actions{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}
		.Awtsmoos-launch-actions button{min-width:120px;padding:9px 14px;border:1px solid rgba(155,255,205,.52);border-radius:10px;background:#10251b;color:#f4fff8;font-weight:800;cursor:pointer}
		.Awtsmoos-launch[data-state="failed"] .Awtsmoos-launch-mark{color:#ff8d86}.Awtsmoos-launch[data-state="failed"] .Awtsmoos-launch-track{border-color:rgba(255,107,107,.6)}
	`;
	(documentValue.head || documentValue.documentElement).append(style);
}
