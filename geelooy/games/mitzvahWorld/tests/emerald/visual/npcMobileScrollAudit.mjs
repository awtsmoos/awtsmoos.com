#!/usr/bin/env node
/**
 * B"H
 * @file npcMobileScrollAudit.mjs
 * @description Chapter 532: The NPC dialogue must fit mobile browser viewports:
 * card constrained, middle scrolls, and action buttons remain reachable.
 */
import fs from 'node:fs';
const layout = fs.readFileSync('ckidsAwtsmoos/Olam/worker/handlers/ui/npcCssLayout.js','utf8');
const buttons = fs.readFileSync('ckidsAwtsmoos/Olam/worker/handlers/ui/npcCssButtons.js','utf8');
const responsive = fs.readFileSync('ckidsAwtsmoos/Olam/worker/handlers/ui/npcCssResponsive.js','utf8');
const details = {
  cardFlexColumn: layout.includes('display:flex') && layout.includes('flex-direction:column') && layout.includes('overflow:hidden'),
  layoutScrolls: layout.includes('.awts-npc-layout') && layout.includes('overflow:auto') && layout.includes('-webkit-overflow-scrolling:touch'),
  buttonsFixedInFlow: buttons.includes('flex:0 0 auto') && buttons.includes('grid-template-columns:repeat(2,1fr)'),
  smallHeightRule: responsive.includes('@media(max-height:680px)') && responsive.includes('max-height:74dvh'),
  mobileMaxHeight: responsive.includes('max-height:78dvh')
};
if (!Object.values(details).every(Boolean)) { console.error(JSON.stringify({ok:false,details},null,2)); process.exit(1); }
console.log(JSON.stringify({ok:true,details},null,2));
