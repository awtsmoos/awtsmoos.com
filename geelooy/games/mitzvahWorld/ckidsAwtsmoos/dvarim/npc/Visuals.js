
// B"H
import { QUEST_STATE } from "../../systems/quests/Shlichus.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const ICON_EXCLAMATION_YELLOW = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNDUgMTUgTDU1IDE1IEw1MyA2NSBMNDcgNjUgWiBNNDUgNzUgTDU1IDc1IEw1NSA4NSBMNDUgODUgWiIgZmlsbD0iI0ZGRDcwMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjMiLz48L3N2Zz4=";
const ICON_QUESTION_SILVER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMzAgMzAgQzMwIDEwIDcwIDEwIDcwIDMwIEM3MCA1MCA1MCA1MCA1MCA3MCBMNTAgODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0MwQzBDMCIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI5MCIgcj0iNSIgZmlsbD0iI0MwQzBDMCIvPjwvc3ZnPg==";
const ICON_QUESTION_YELLOW = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMzAgMzAgQzMwIDEwIDcwIDEwIDcwIDMwIEM3MCA1MCA1MCA1MCA1MCA3MCBMNTAgODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRDcwMCIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI5MCIgcj0iNSIgZmlsbD0iI0ZGRDcwMCIvPjwvc3ZnPg==";

export default {
    updateOverheadIcon(npc) {
        if (!npc.olam || !npc.olam.shlichusHandler) return;
        
        const state = npc.olam.shlichusHandler.getNpcState(npc.id);
        
        let iconUrl = null;
        if (state === 'READY') iconUrl = ICON_QUESTION_YELLOW;
        else if (state === 'WAITING') iconUrl = ICON_QUESTION_SILVER;
        else if (state === 'AVAILABLE') iconUrl = ICON_EXCLAMATION_YELLOW;
        
        if (npc.iconState !== state) {
            npc.iconState = state;
            npc.iconPath = iconUrl ? "custom_icon" : "chossid.svg"; 
            npc.iconType = iconUrl ? "url" : "centered";
            
            if (npc.olam.minimap) {
                 npc.olam.minimap.removeMinimapItem(npc, "npcs");
                 if (iconUrl) {
                     npc.getIcon = async () => `<img src="${iconUrl}" style="width:100%;height:100%;" />`;
                     npc.olam.minimap.setMinimapItem(npc, "npcs");
                 }
            }
        }
    }
}
