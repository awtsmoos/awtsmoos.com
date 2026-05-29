// B"H
/**
 * @file style.js
 * @description
 * Chapter 46: The wardrobe becomes solid glassless gold, no smear, no blur.
 * The Awtsmoos measures the vessel cleanly so inventory can open without
 * painting a fog wall across the desert.
 */
const css = String.raw`
#inventoryScreen.awtsmoosInventoryViewer{
  position:fixed!important;left:14px!important;right:14px!important;top:112px!important;bottom:calc(82px + env(safe-area-inset-bottom))!important;width:auto!important;height:auto!important;max-width:calc(100vw - 28px)!important;z-index:26000!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;pointer-events:auto!important;touch-action:none!important;color:#fff3c4!important;font-family:Arial,sans-serif!important;background:linear-gradient(180deg,rgba(25,18,9,.98),rgba(3,3,1,.985))!important;border:2px solid rgba(255,206,82,.92)!important;border-radius:24px!important;box-shadow:0 0 34px rgba(0,0,0,.78),inset 0 0 22px rgba(255,198,62,.08)!important
}
#inventoryScreen.hidden{display:none!important}
#inventoryScreen *{box-sizing:border-box!important;touch-action:manipulation!important}
#inventoryScreen.awtsmoosInventoryViewer::before{content:""!important;position:absolute!important;top:10px!important;left:50%!important;transform:translateX(-50%)!important;width:72px!important;height:7px!important;border-radius:999px!important;background:#d6a94a!important;z-index:4!important}
#inventoryScreen .header{height:82px!important;flex:0 0 82px!important;display:flex!important;align-items:end!important;justify-content:space-between!important;gap:10px!important;padding:24px 18px 12px!important;border-bottom:1px solid rgba(255,205,87,.28)!important;background:rgba(0,0,0,.34)!important}
#inventoryScreen .text{font-weight:900!important;letter-spacing:.045em!important;color:#ffd25c!important;font-size:clamp(18px,5vw,24px)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;text-shadow:0 2px 8px #000!important}
#inventoryScreen button{pointer-events:auto!important;color:#ffe9a8!important;font-weight:900!important;font-family:Arial,sans-serif!important}
#inventoryScreen .close{width:48px!important;height:48px!important;min-width:48px!important;border-radius:16px!important;background:rgba(255,204,73,.18)!important;border:1px solid rgba(255,214,102,.5)!important;font-size:32px!important;line-height:1!important}
#inventoryScreen .inventory-body{flex:1 1 auto!important;min-height:0!important;display:grid!important;grid-template-rows:62px minmax(0,1fr) 94px!important;gap:12px!important;padding:12px 14px 16px!important;overflow:hidden!important}
#inventoryScreen .wardrobe-tabs{height:62px!important;display:grid!important;grid-auto-flow:column!important;grid-auto-columns:minmax(74px,1fr)!important;gap:8px!important;overflow-x:auto!important;overflow-y:hidden!important;-webkit-overflow-scrolling:touch!important;padding-bottom:2px!important}
#inventoryScreen .wardrobe-tab{height:58px!important;border:1px solid rgba(255,213,91,.45)!important;border-radius:16px!important;background:rgba(255,255,255,.06)!important;color:#ffe9a8!important;font-size:10px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:3px!important;padding:3px!important;min-width:74px!important}
#inventoryScreen .wardrobe-tab.active{background:linear-gradient(180deg,#e9ba41,#9d6816)!important;color:#140d02!important}
#inventoryScreen .wardrobe-tab .ico{font-size:22px!important;line-height:1!important}
#inventoryScreen .main-slots-holder{min-height:0!important;overflow:auto!important;-webkit-overflow-scrolling:touch!important;padding:0 2px 6px!important}
#inventoryScreen .slots{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important;padding:0!important;margin:0!important}
#inventoryScreen .inv-card{height:92px!important;min-height:92px!important;border:2px solid rgba(196,145,38,.58)!important;border-radius:17px!important;background:radial-gradient(circle at 50% 18%,rgba(255,255,255,.12),rgba(0,0,0,.45))!important;display:flex!important;align-items:center!important;justify-content:center!important;position:relative!important;overflow:hidden!important;pointer-events:auto!important;padding:0!important}
#inventoryScreen .inv-card.selected{border-color:#76ff8a!important;box-shadow:0 0 0 3px rgba(118,255,138,.18),0 0 18px rgba(118,255,138,.28)!important}
#inventoryScreen .slotBtn{font-size:34px!important;line-height:1!important}
#inventoryScreen .slotName{position:absolute!important;left:5px!important;right:5px!important;bottom:5px!important;text-align:center!important;font-size:11px!important;text-shadow:0 1px 4px #000!important;background:rgba(0,0,0,.48)!important;border-radius:8px!important;padding:2px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#inventoryScreen .equippedMark{position:absolute!important;right:5px!important;top:5px!important;width:26px!important;height:26px!important;border-radius:50%!important;display:flex!important;align-items:center!important;justify-content:center!important;background:#58b957!important;color:#fff!important;font-weight:900!important}
#inventoryScreen .wardrobe-footer{display:grid!important;grid-template-rows:26px 62px!important;gap:6px!important;min-height:0!important}
#inventoryScreen .selected-label{text-align:center!important;color:#ffe9a8!important;font-size:16px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#inventoryScreen .equip-main-btn{height:62px!important;border-radius:18px!important;background:linear-gradient(180deg,#efbd43,#9a6718)!important;color:#1a1000!important;font-size:22px!important;width:100%!important;border:0!important}
@media (max-width:380px){#inventoryScreen.awtsmoosInventoryViewer{left:8px!important;right:8px!important;top:104px!important;bottom:calc(74px + env(safe-area-inset-bottom))!important;max-width:calc(100vw - 16px)!important}#inventoryScreen .inventory-body{padding:10px!important;gap:9px!important;grid-template-rows:58px minmax(0,1fr) 88px!important}#inventoryScreen .inv-card{height:78px!important;min-height:78px!important}#inventoryScreen .slotBtn{font-size:28px!important}}
@media (min-width:900px) and (min-aspect-ratio:4/3){#inventoryScreen.awtsmoosInventoryViewer{left:50%!important;right:auto!important;top:78px!important;bottom:28px!important;transform:translateX(-50%)!important;width:min(720px,72vw)!important;max-width:720px!important}#inventoryScreen .slots{grid-template-columns:repeat(4,1fr)!important}#inventoryScreen .inv-card{height:102px!important;min-height:102px!important}}
`;
export default { tag: "style", innerHTML: css };
