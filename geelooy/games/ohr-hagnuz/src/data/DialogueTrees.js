
import { NPCRegistry } from './NPCs/Registry.js';
import { DialogueIndex } from './NPCs/dialogue/DialogueIndex.js';

/**
 * B"H
 * @chapter The Unified Word
 * @description
 * All branching trees are collected here.
 * We resolve the NPC by looking up its symbol in the Registry.
 * If the physical symbol loses its mapping, it reverts to DEFAULT.
 */
export const DialogueTrees = new Proxy(DialogueIndex, {
    get: (target, prop) => {
        // Resolve the Unicode symbol to the string ID
        const key = NPCRegistry[prop] || prop;
        return target[key] || target['DEFAULT'];
    }
});

export const WisdomStrings = DialogueTrees;
