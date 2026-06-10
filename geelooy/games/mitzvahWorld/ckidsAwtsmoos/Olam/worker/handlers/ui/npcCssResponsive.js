// B"H
/**
 * @file npcCssResponsive.js
 * @description Chapter 528: Phone browser chrome is brutal; the card now fits
 * the remaining viewport and keeps a two-column action grid unless truly tiny.
 */
export const NPC_UI_RESPONSIVE = `@media(max-width:620px){#awtsmoos-npc-overlay,#awtsmoos-npc-shop{align-items:flex-end!important;justify-content:center!important;padding:8px 10px calc(8px + env(safe-area-inset-bottom))!important}.awts-npc-card,.awts-shop-card{width:100%!important;max-height:78dvh!important;border-radius:24px!important}.awts-npc-title,.awts-shop-title{font-size:clamp(30px,8vw,42px)!important}.awts-npc-actions,.awts-shop-tabs{grid-template-columns:1fr 1fr!important}.awts-npc-level-grid{grid-template-columns:1fr!important}}@media(max-height:680px){.awts-npc-card,.awts-shop-card{max-height:74dvh!important;padding:14px!important}.awts-npc-lines p{margin:6px 0!important}.awts-npc-btn,.awts-shop-btn{min-height:48px!important}}@media(max-width:360px){.awts-npc-actions,.awts-shop-tabs{grid-template-columns:1fr!important}.awts-shop-row{grid-template-columns:46px 1fr!important}.awts-shop-row button{grid-column:1/-1!important}}`;
