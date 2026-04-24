
/**
 * B"H
 * @class HunterEngine
 * @description The Eternal Watchman.
 * Just as the Awtsmoos watches over every creature and every detail 
 * of creation every second, this engine watches the scroll to synchronize 
 * the focus of the user with the depth of the data.
 */
export class HunterEngine {
    constructor(scrollContainer) {
        this.scroller = scrollContainer;
        this.observer = null;
        this.activeIdx = null;
    }

    /**
     * @method awaken
     * @description Activates the watchman's eyes.
     */
    awaken() {
        console.log("B\"H - Hunter Engine Awakened.");
        const options = {
            root: this.scroller,
            rootMargin: "-45% 0px -45% 0px",
            threshold: 0.01
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.onFocus(entry.target);
                }
            });
        }, options);

        this.refresh();
    }

    /**
     * @method refresh
     * @description Re-scans the world for new targets to watch.
     */
    refresh() {
        const targets = document.querySelectorAll('.section-vessel, .sub-awtsmoos');
        targets.forEach(t => this.observer.observe(t));
    }

    /**
     * @method onFocus
     * @description Reacts when a part of the text enters the Golden Ring.
     */
    onFocus(el) {
        const idx = el.dataset.awtsmoosIdx;
        const sub = el.dataset.awtsmoosSub;
        
        if (this.activeIdx === idx && this.activeSub === sub) return;
        
        this.activeIdx = idx;
        this.activeSub = sub;

        // Command the world to synchronize
        window.dispatchEvent(new CustomEvent("awtsmoos_focus_change", {
            detail: { idx, sub, timestamp: Date.now() }
        }));
    }
}
