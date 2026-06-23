// B"H
import { createPanelLifecycleManager } from '../../systems/ui/PanelLifecycleManager.js';
import { shlichusBookPages } from '../../systems/ui/ShlichusBookPages.js';
const m=createPanelLifecycleManager(); m.open('quests'); m.open('inventory'); if(m.state().top!=='inventory') throw new Error('Panel stack top failed'); m.close(); if(m.state().top!=='quests') throw new Error('Panel close failed');
if(!shlichusBookPages().some(p=>p.id==='learning')) throw new Error('Learning page missing');
console.log('B"H shlichusBookLifecycleAudit passed');
