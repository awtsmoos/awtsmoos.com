
import { NPCRegistry } from './NPCs/Registry.js';
import { DialogueIndex } from './NPCs/dialogue/DialogueIndex.js';
import { WildOtiot } from './NPCs/dialogue/wild/WildOtiot.js';
import { RebbeShlichus } from './NPCs/dialogue/RebbeShlichus.js';

DialogueIndex['REBBE_SHLICHUS'] = RebbeShlichus;
DialogueIndex['א'] = WildOtiot;
DialogueIndex['מ'] = WildOtiot;
DialogueIndex['ת'] = WildOtiot;

/**
 * B"H
 * @chapter The Unified Word
 */
export const DialogueTrees = new Proxy(DialogueIndex, {
    get: (target, prop) => {
        const key = NPCRegistry[prop] || prop;
        return target[key] || target['DEFAULT'];
    }
});

export const WisdomStrings = DialogueTrees;
