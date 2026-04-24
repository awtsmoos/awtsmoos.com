
/**
 * B"H
 * @class AlchemyEngine
 * @description The Transmuter of Forms.
 * Controls the Sefirotic attributes of the UI (Colors, Fonts, Sizes).
 * It pulls preferences from the local memory (LocalStorage) and manifests 
 * them in the CSS variables of the root context.
 */
export class AlchemyEngine {
    constructor(rootElement) {
        this.root = rootElement;
        this.storageKey = "awtsmoos_alchemy";
        this.state = this.loadState();
    }

    /**
     * @method loadState
     * @description Retrieves the soul's memory of past forms.
     */
    loadState() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : {
            theme: "parchment",
            fontSize: "24px",
            fontFamily: "var(--font-manuscript)",
            customColors: {}
        };
    }

    /**
     * @method transmute
     * @description Applies the current state to the physical root.
     */
    transmute() {
        console.log("B\"H - Alchemy Engine Transmuting...");
        const s = this.state;
        
        this.root.dataset.theme = s.theme;
        this.root.style.setProperty('--post-text-size', s.fontSize);
        this.root.style.setProperty('--font-manuscript', s.fontFamily);
        
        Object.entries(s.customColors).forEach(([key, val]) => {
            this.root.style.setProperty(key, val);
        });
    }

    /**
     * @method saveState
     * @description Anchors the current form into memory.
     */
    saveState(newState) {
        this.state = { ...this.state, ...newState };
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        this.transmute();
    }
}
