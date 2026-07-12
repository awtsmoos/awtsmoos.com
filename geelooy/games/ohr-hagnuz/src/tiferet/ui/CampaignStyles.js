/**
 * B"H
 * @module CampaignStyles
 * @description Responsive vessels for scenes, mission panels, shops, crafting, and party management.
 */
const STYLE_ID = 'ohr-campaign-styles';

const css = `
.ohr-panel-shell[data-open="true"],.ohr-dialogue-shell[data-open="true"]{pointer-events:auto}
.ohr-panel,.ohr-dialogue{max-height:min(76vh,720px);overflow:auto;overscroll-behavior:contain}
.ohr-panel section{display:grid;gap:10px;margin-top:14px}
.ohr-panel p{display:grid;grid-template-columns:minmax(120px,.8fr) minmax(0,1.2fr);gap:14px;margin:0;padding:10px 12px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(8,12,28,.56)}
.ohr-panel p span{text-align:right;overflow-wrap:anywhere}
.ohr-shop-row{padding:14px;border:1px solid rgba(255,224,130,.3);border-radius:16px;background:linear-gradient(145deg,rgba(18,32,55,.95),rgba(9,13,29,.95));box-shadow:0 9px 24px rgba(0,0,0,.26)}
.ohr-shop-row h3{margin:0 0 6px;color:#fff1a8;font-size:1rem}
.ohr-shop-row p{display:block;padding:0;border:0;background:none;color:#d9e8f2}
.ohr-shop-row small{display:block;margin:8px 0;color:#9fc4d8}
.ohr-shop-row div,.ohr-scene-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.ohr-shop-row button,.ohr-scene-choices button,.ohr-dialogue footer button{min-height:44px;padding:9px 12px;border:1px solid rgba(255,224,130,.55);border-radius:12px;background:#172f46;color:#fffde7;font-weight:850}
.ohr-shop-row button:disabled{opacity:.4;filter:grayscale(1)}
.ohr-shop-row button:not(:disabled):active,.ohr-scene-choices button:active{transform:scale(.98)}
.ohr-dialogue-count{margin-bottom:8px;color:#a9c9da;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase}
.ohr-dialogue>p{font-size:clamp(1rem,2.4vw,1.18rem);line-height:1.55}
.ohr-scene-choices{grid-template-columns:1fr;margin-top:14px}
.ohr-right-rail{max-height:62vh;overflow:auto;scrollbar-width:none}
.ohr-world-card span{display:block;max-width:min(70vw,620px);white-space:normal;line-height:1.25}
@media (max-width:700px){
	.ohr-panel,.ohr-dialogue{width:calc(100vw - 24px);max-width:none;max-height:72vh}
	.ohr-panel p{grid-template-columns:1fr;gap:4px}
	.ohr-panel p span{text-align:left}
	.ohr-shop-row div{grid-template-columns:1fr 1fr}
	.ohr-right-rail{right:8px;gap:5px}
	.ohr-right-rail .ohr-touch{min-width:58px}
}
@media (max-height:650px){
	.ohr-panel,.ohr-dialogue{max-height:68vh}
	.ohr-world-card{max-width:58vw}
}
`;

export const installCampaignStyles = () => {
	if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return false;
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = css;
	document.head.appendChild(style);
	return true;
};
