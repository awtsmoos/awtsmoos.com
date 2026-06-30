//B"H
export default id => /*css*/`
.${id}.desktop{position:relative;width:100vw;height:calc(100vh - 40px);overflow:hidden;background:linear-gradient(180deg,#3b8ef3 0%,#1f66cf 46%,#39a13c 100%);font-family:"Trebuchet MS",Tahoma,system-ui,sans-serif;user-select:none;color:white}
.${id}.desktop::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 22% 18%,rgba(255,255,255,.46),transparent 13%),linear-gradient(180deg,rgba(255,255,255,.2),transparent 35%);pointer-events:none}
.${id} .awtsmoos-desktop-surface{position:absolute;inset:0;z-index:1;outline:none;overflow:hidden}
.${id} .desktop-icon{position:absolute;width:92px;min-height:82px;border:1px solid transparent;border-radius:0;background:transparent;color:white;display:grid;justify-items:center;align-content:start;gap:3px;padding:6px 4px;text-shadow:1px 1px 2px rgba(0,0,0,.8);cursor:default;touch-action:none;font:11px Tahoma,sans-serif}
.${id} .desktop-icon:hover{border:1px dotted rgba(255,255,255,.9);background:rgba(49,106,197,.22)}
.${id} .desktop-icon.selected{border:1px dotted #fff;background:rgba(49,106,197,.55)}
.${id} .desktop-icon:focus-visible{outline:1px dotted #fff;outline-offset:1px}.desktop-dragging .desktop-icon.selected{opacity:.9}
.${id} .desktop-icon-glyph{display:grid;place-items:center;width:42px;height:42px;font-size:33px;filter:drop-shadow(1px 3px 2px rgba(0,0,0,.4))}
.${id} .desktop-icon-label{max-width:86px;padding:1px 2px;font-size:11px;font-weight:normal;line-height:1.17;text-align:center;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;overflow-wrap:anywhere}
.${id} .desktop-icon.selected .desktop-icon-label{background:#316ac5;color:#fff}.desktop-marquee{position:absolute;z-index:3;border:1px dotted #000;background:rgba(49,106,197,.2);pointer-events:none}
.contextMenu{position:absolute;z-index:100000;min-width:188px;padding:2px;border:1px solid #716f64;border-radius:0;background:#fff;color:#111;box-shadow:2px 2px 0 rgba(0,0,0,.28);font:11px Tahoma,system-ui,sans-serif}.contextMenu .menuItem{padding:4px 24px 4px 20px;cursor:default;border-radius:0;white-space:nowrap;max-width:280px;overflow:hidden;text-overflow:ellipsis}.contextMenu .menuItem:hover{background:#316ac5;color:white}.contextMenu .menuItem.disabled{color:#777;background:#eee;pointer-events:none}
@media (prefers-reduced-motion:reduce){.${id} .desktop-icon{transition:none!important}}
`;
/** B"H: Desktop, menus, marquee, and labels now obey one sharper Windows XP law. */
