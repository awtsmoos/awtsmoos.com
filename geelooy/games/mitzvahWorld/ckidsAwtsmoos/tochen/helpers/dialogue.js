//B"H
/**
 * DIALOGUE (DIBUR)
 * The power of speech that connects entities within the Olam.
 * B"H - Ensured this is exported as a valid JS module.
 */
export const DialogueSystem = {
    /**
     * Manifests speech in the console.
     * @param {string} text 
     */
    say: (text) => {
        console.log(`B"H - [Dialogue] Speech: ${text}`);
    },
    
    /**
     * Initializes the dialogue vessels.
     */
    init: () => {
        console.log('B"H - Dialogue System Manifested.');
    }
};
