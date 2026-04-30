
import { MapRenderEngine } from '../graphics/MapRenderEngine.js';
import { MenuRenderEngine } from '../graphics/MenuRenderEngine.js';
import { DialogueEngine } from '../graphics/DialogueEngine.js';

/**
 * B"H
 * Pure Sefirotic routing mappings. Binds logical abstract states to explicit 
 * graphic rendering routines entirely. 
 * Just as light from Keter filters through Chochmah and Binah before
 * breaking into seven colors through Tiferet, so too do we route states here.
 */
export const RendererMap = {
    'OVERWORLD': {
        executePaintSequence: (cxList) => {
            MapRenderEngine.draw(cxList);
        }
    },
    'DIALOGUE': {
        executePaintSequence: (cxList) => {
            MapRenderEngine.draw(cxList); 
            DialogueEngine.drawTextFrame(cxList); 
        }
    },
    'BATTLE': {
        executePaintSequence: (cxList) => {
            MenuRenderEngine.executePaintSequence(cxList);
        }
    },
    'VOID': {
        executePaintSequence: (cx) => { cx.BG.fillStyle='#000'; cx.BG.fillRect(0,0,320,320); }
    }
};
