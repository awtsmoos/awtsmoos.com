// B"H
/**
 * @file npcCssResponsive.js
 * @description Chapter 273: On narrow screens the parchment still breathes and
 * buttons stay large.
 */
export const NPC_UI_RESPONSIVE = `@media(max-width:620px){#awtsmoos-npc-overlay,#awtsmoos-npc-shop{align-items:flex-end!important;justify-content:center!important;padding:10px 12px calc(76px + env(safe-area-inset-bottom))!important}.awts-npc-actions,.awts-shop-tabs{grid-template-columns:1fr 1fr!important}.awts-npc-card,.awts-shop-card{width:100%!important}}@media(max-width:390px){.awts-npc-actions,.awts-shop-tabs{grid-template-columns:1fr!important}.awts-shop-row{grid-template-columns:46px 1fr!important}.awts-shop-row button{grid-column:1/-1!important}}`;
