// B"H

class ParagraphHighlighter {
    constructor(
        containerSelector, 
        paragraphSelector, 
        onHighlightCallback,
        options = {
            deselectEnabled: true,
            onDeselectCallback: () => {}
        }
    ) {
        this.containerSelector = containerSelector;
        this.paragraphSelector = paragraphSelector;
        this.onHighlightCallback = onHighlightCallback;
        this.options = options;

        this.currentParagraph = null;

        // Bind methods
        this.highlightParagraph = this.highlightParagraph.bind(this);

        this.refresh();
        this.init();
    }

    /**
     * Re-queries the DOM for container and paragraphs.
     * Useful when content is dynamically loaded.
     */
    refresh() {
        this.paragraphContainer = document.querySelector(this.containerSelector);

        if (!this.paragraphContainer) {
            console.warn(`Highlighter: Container "${this.containerSelector}" not found.`);
            this.paragraphs = [];
            return;
        }

        // Get all potential targets in document order
        this.paragraphs = Array.from(this.paragraphContainer.querySelectorAll(this.paragraphSelector));
        
        // Reset state
        this.currentParagraph = null;
    }

    /**
     * Main logic to detect the active paragraph.
     * Uses getBoundingClientRect to be agnostic of DOM nesting/positioning.
     */
    highlightParagraph() {
        if (!this.paragraphContainer || this.paragraphs.length === 0) return;

        const containerRect = this.paragraphContainer.getBoundingClientRect();
        
        // Define the "Reading Line" (Trigger Point).
        // 30% down the container is a natural focus point for reading.
        const triggerLine = containerRect.top + (containerRect.height * 0.3);

        let activeParagraph = null;
        let activeIndex = -1;
        let minDistance = Infinity;

        // Iterate through paragraphs to find the best match
        for (let i = 0; i < this.paragraphs.length; i++) {
            const p = this.paragraphs[i];
            const rect = p.getBoundingClientRect();

            // Optimization: If the paragraph is completely below the container bottom,
            // subsequent paragraphs will also be below (assuming document order). We can stop.
            if (rect.top > containerRect.bottom) {
                break;
            }

            // Optimization: Skip if completely above the container top (scrolled past)
            // But don't break, as the next one might be entering.
            if (rect.bottom < containerRect.top) {
                continue;
            }

            // 1. Direct Hit: The reading line is INSIDE this paragraph
            if (rect.top <= triggerLine && rect.bottom >= triggerLine) {
                activeParagraph = p;
                activeIndex = i;
                break; // Found the specific paragraph being read
            }

            // 2. Gap Handling: If no paragraph covers the line (e.g., margins/padding),
            // track the one closest to the line to select it as a fallback.
            const dist = Math.abs(rect.top - triggerLine);
            if (dist < minDistance) {
                minDistance = dist;
                activeParagraph = p;
                activeIndex = i;
            }
        }

        // Update State
        if (this.currentParagraph !== activeParagraph) {
            // Deactivate previous
            if (this.currentParagraph) {
                this.currentParagraph.classList.remove('active');
            }

            // Activate new
            if (activeParagraph) {
                activeParagraph.classList.add('active');
                if (typeof this.onHighlightCallback === 'function') {
                    this.onHighlightCallback(activeParagraph, activeIndex);
                }
            } else {
                // No paragraph is active (e.g. at very top/bottom of scroll)
                if (this.options.deselectEnabled && typeof this.options.onDeselectCallback === 'function') {
                    this.options.onDeselectCallback();
                }
            }

            this.currentParagraph = activeParagraph;
        }
    }

    init() {
        if (this.paragraphContainer) {
            // Use direct scroll listener as requested
            this.paragraphContainer.addEventListener('scroll', () => this.highlightParagraph(), { passive: true });
            
            // Initial check
            this.highlightParagraph();
        }
    }

    /**
     * External API to refresh data and re-run highlight logic.
     */
    updateParagraphs() {
        this.refresh();
        this.highlightParagraph();
    }
}

export default ParagraphHighlighter;