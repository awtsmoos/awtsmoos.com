// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldChatPanelStyle.js
	* @description Styles retractable chat, protection, report evidence, and moderator adjudication.
	* The Awtsmoos permits a word without covering the road; Awtsmoos.com keeps the closed room
	* small, history readable, judgment bounded, focus visible, and mobile controls clear.
	*/

const STYLE_ID = 'Awtsmoos-multiplayer-chat-style';

export function installMitzvahWorldChatPanelStyle(documentValue = document) {
	if (documentValue.getElementById(STYLE_ID)) return;
	const style = documentValue.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		.Awtsmoos-chat{position:fixed;left:14px;bottom:14px;z-index:800;width:min(430px,calc(100vw - 28px));color:#edf7f3;border:1px solid #8d7448;border-radius:14px;background:#07100ef2;box-shadow:0 18px 50px #0009;font:12px system-ui;backdrop-filter:blur(12px)}
		.Awtsmoos-chat header{display:flex;align-items:center;gap:8px;padding:9px 10px}.Awtsmoos-chat[data-open="true"] header{border-bottom:1px solid #ffffff18}.Awtsmoos-chat header strong{color:#ffd98e}.Awtsmoos-chat header output{margin-left:auto;color:#9fd5c1}
		.Awtsmoos-chat-toggle{border:0;background:none;color:#fff;font-size:18px;cursor:pointer}.Awtsmoos-chat[data-open="false"]{width:auto;max-width:230px}.Awtsmoos-chat[data-open="false"] .Awtsmoos-chat-body{display:none}
		.Awtsmoos-chat-body{padding:8px}.Awtsmoos-chat-controls{display:grid;grid-template-columns:110px 1fr;gap:6px}.Awtsmoos-chat select,.Awtsmoos-chat input{min-width:0;border:1px solid #405952;border-radius:8px;background:#0b1916;color:#f7fff9;padding:8px}
		.Awtsmoos-chat-target[data-visible="false"]{display:none}.Awtsmoos-chat-history{height:180px;overflow:auto;margin:7px 0;padding:7px;border-radius:8px;background:#020706a8}.Awtsmoos-chat-line{margin:0 0 7px;line-height:1.35;overflow-wrap:anywhere}.Awtsmoos-chat-line strong{color:#f0c878}.Awtsmoos-chat-line[data-private="true"] strong{color:#d8a9ff}
		.Awtsmoos-chat-compose{display:grid;grid-template-columns:1fr auto;gap:6px}.Awtsmoos-chat button{border:1px solid #c69a4f;border-radius:8px;background:#3a2814;color:#ffe6af;font-weight:800;padding:8px}.Awtsmoos-chat-status{min-height:17px;color:#e2b766;margin-top:5px}
		.Awtsmoos-chat-moderation,.Awtsmoos-chat-review{margin-top:7px;padding:6px;border:1px solid #ffffff18;border-radius:9px;background:#081511}.Awtsmoos-chat-moderation summary,.Awtsmoos-chat-review summary{cursor:pointer;color:#c9e7db;font-weight:800}.Awtsmoos-chat-moderation[open],.Awtsmoos-chat-review[open]{display:grid;gap:6px}.Awtsmoos-chat-moderation-actions,.Awtsmoos-chat-report-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:4px}.Awtsmoos-chat-moderation output{color:#9fd5c1}
		.Awtsmoos-chat-report-card{display:grid;gap:5px;margin-top:7px;padding:7px;border:1px solid #ffffff1f;border-radius:8px;background:#020706aa}.Awtsmoos-chat-report-card p{margin:0;overflow-wrap:anywhere}.Awtsmoos-chat-report-card small{color:#9fd5c1;overflow-wrap:anywhere}
		.Awtsmoos-chat button:focus-visible,.Awtsmoos-chat input:focus-visible,.Awtsmoos-chat select:focus-visible,.Awtsmoos-chat summary:focus-visible,.Awtsmoos-chat-line:focus-visible{outline:3px solid #ffe08a;outline-offset:2px}@media(max-width:620px){.Awtsmoos-chat{left:8px;bottom:8px;width:calc(100vw - 16px)}.Awtsmoos-chat[data-open="false"]{width:auto}.Awtsmoos-chat-history{height:130px}.Awtsmoos-chat-moderation-actions,.Awtsmoos-chat-report-actions{grid-template-columns:1fr}}
	`;
	documentValue.head.appendChild(style);
}
