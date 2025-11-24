// B"H

class ParagraphHighlighter {
    constructor(
        containerSelector, 
        paragraphSelector, 
        onHighlightCallback,
        options = {
            deselectEnabled= true,
            onDeselectCallback= () => {}
        }={}
    ) {
        this.options = options;
        this.paragraphSelector = paragraphSelector;
        this.containerSelector = containerSelector;
        this.onHighlightCallback = onHighlightCallback;
        this.refresh();
        this.init();
        // Bind the highlight function to allow it to be attached to events easily
        this.highlightParagraph = this.highlightParagraph.bind(this);

        // Add a new property to keep track of the previously active paragraph
        this.previouslyActiveParagraph = null;
    }

    refresh() {
        this.paragraphContainer = document.querySelector(this.containerSelector);

        if (!this.paragraphContainer) {
            console.error(`Container with selector "${this.containerSelector}" not found.`);
            this.paragraphs = []; // Ensure paragraphs is an array even if container not found
            return;
        }

        this.paragraphs = Array.from(this.paragraphContainer.querySelectorAll(this.paragraphSelector));

        this.lastParagraph = null;
        this.currentParagraph = null;
        this.previouslyActiveParagraph = null; // Reset on refresh
    }

    highlightParagraph() {
        let topParagraph = null;
        let currentIndex = null;

        if (!this.paragraphContainer) {
            return;
        }

        // Get container's current scroll position relative to its top
        // Adding a buffer for the "active" paragraph to be roughly in the middle third
        const containerScrollTop = this.paragraphContainer.scrollTop;
        const containerHeight = this.paragraphContainer.offsetHeight;
        const viewPortCenter = containerScrollTop + (containerHeight / 2); // More robust center point

        // Find the first paragraph whose top is closest to the viewport center
        // Or simply the first visible one if scrolling up
        let bestParagraph = null;
        let minDistanceToCenter = Infinity;

        for (let i = 0; i < this.paragraphs.length; i++) {
            const paragraph = this.paragraphs[i];
            const paragraphRect = paragraph.getBoundingClientRect();
            const paragraphTopRelativeToContainer = paragraphRect.top + containerScrollTop - this.paragraphContainer.getBoundingClientRect().top;
            const paragraphBottomRelativeToContainer = paragraphTopRelativeToContainer + paragraph.offsetHeight;

            // Check if the paragraph is within the visible part of the container
            // We are looking for the paragraph that is "most visible" or the first one we enter when scrolling up.
            // The logic for identifying the "top" paragraph needs to be consistent.
            // A common approach is to find the paragraph whose *top* edge is closest to the *top* of the visible area.
            // Or, as your original code did, check for overlap with a central zone.

            // Let's refine the "top paragraph" detection to be more precise for both scroll directions.
            // We want the paragraph whose top edge is the highest and still within the viewport,
            // or the one that occupies the most central space.

            // A simpler approach: identify the paragraph whose top is *just* below the scroll point.
            // When scrolling down, this is the first one you hit.
            // When scrolling up, this is also the first one you hit.

            // Let's re-evaluate the logic:
            // We want the paragraph that is currently most "in focus".
            // A common heuristic is the paragraph whose top edge is closest to the center of the viewport.
            // However, for deselection, we need to know when we *leave* a paragraph.

            // Let's adapt your original logic but ensure we find the *first* paragraph that starts
            // *before* the scroll point.

            // Check if the paragraph's top is within the current scroll view.
            // We'll use a central zone of the viewport.
            const paragraphTop = paragraph.offsetTop;
            const paragraphBottom = paragraphTop + paragraph.offsetHeight;

            // Define a "highlight zone" - roughly the middle third of the container
            const highlightZoneTop = containerScrollTop + (containerHeight / 3);
            const highlightZoneBottom = containerScrollTop + (2 * containerHeight / 3);

            // If the paragraph's top is above the highlight zone and its bottom is below the highlight zone
            // it's a good candidate.
            // OR, if it's the first paragraph whose top is above the viewport's upper edge.

            // Refined logic: find the first paragraph that starts *above* the current scroll position's viewport center.
            // This naturally handles scrolling up and down.
            if (paragraphTop < viewPortCenter && paragraphBottom > viewPortCenter) {
                 // This paragraph is currently covering the viewport center.
                 topParagraph = paragraph;
                 currentIndex = i;
                 break; // Found the most central one
            } else if (paragraphTop < viewPortCenter && i === this.paragraphs.length - 1) {
                // If we've reached the last paragraph and its top is still above the center
                // it means the last paragraph is the one in view.
                topParagraph = paragraph;
                currentIndex = i;
                break;
            }
        }

        if (topParagraph) {
            // Deselect the previously active paragraph if it's different from the current one
            if (
                this.previouslyActiveParagraph && 
                this.previouslyActiveParagraph !== topParagraph
               // && this?.options?.deselectEnabled
            ) {
                
                this.previouslyActiveParagraph.classList.remove('active');
            }

            // Add 'active' class to the current top paragraph if it's not already there
            if (!topParagraph.classList.contains("active")) {
                // Remove 'active' class from all paragraphs *except* the current one
                // This is a slightly different approach: only remove from non-current paragraphs
                // to avoid flickering if the same paragraph stays active.
                this.paragraphs.forEach(p => {
                    if (
                        p !== topParagraph
                     //   &&  this?.options?.deselectEnabled
                    ) {
                        p.classList.remove('active');
                    }
                });
                topParagraph.classList.add('active');
            }

            // Call the callback if a new paragraph has become the top paragraph
            // We are now tracking `topParagraph` as the `currentParagraph`.
            if (this.currentParagraph !== topParagraph) {
                this.onHighlightCallback(topParagraph, currentIndex);
                this.previouslyActiveParagraph = this.currentParagraph; // Update previously active
                this.currentParagraph = topParagraph;
            }
        } else {
            // If no paragraph is detected (e.g., scrolled past all), deselect any active one
            if (
                this.previouslyActiveParagraph
              //  && this?.options?.deselectEnabled
            ) {
               
                this.previouslyActiveParagraph.classList.remove('active');
                this.previouslyActiveParagraph = null;
            }
            if (
                this.currentParagraph &&
                this?.options?.deselectEnabled
            ) {
                 this?.options?.onDeselectCallback?.();
                this.currentParagraph.classList.remove('active');
                this.currentParagraph = null;
            }
        }
    }

    init() {
        // Attach the highlightParagraph function to scroll events
        if (this.paragraphContainer) {
            this.paragraphContainer.addEventListener('scroll', () => this.highlightParagraph());
            // Also call it once on initialization to highlight the initial visible paragraph
            this.highlightParagraph();
        } else {
            console.error("Cannot initialize scroll listener: Paragraph container not found.");
        }
    }

    // Optional: Add a method to update the paragraphs if content changes dynamically
    updateParagraphs() {
        this.refresh();
        this.highlightParagraph(); // Re-evaluate after updating
    }
}

export default ParagraphHighlighter;