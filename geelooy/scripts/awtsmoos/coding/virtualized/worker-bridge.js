
// B"H
// FILE: js/coding/virtualized/worker-bridge.js

export const WorkerMethods = {
    _initializeHighlightingWorker() {
        try {
            this.highlighterWorker = new Worker(new URL('../highlighter.worker.js', import.meta.url), { type: 'module' });
            this.highlighterWorker.onmessage = this._onWorkerMessage.bind(this);
            this.highlighterWorker.onerror = (e) => console.error("Worker Error:", e);

            this.highlighterWorker.postMessage({
                type: 'setText',
                text: this.textarea.value,
                language: this.language
            });
        } catch (e) {
            console.error("Worker Init Failed:", e);
        }
    },

    async _update() {
        const txt = this.textarea.value;
        this.lines = txt.split("\n");

        if (this.highlighterWorker) {
            this.highlighterWorker.postMessage({
                type: 'setText',
                text: txt,
                language: this.language
            });
        }

        const BUFFER_LINES = 10;
        // Ensure wrapper has height before calculating
        if (!this.wrapper.clientHeight) return; 
        
        const neededDivs = Math.ceil(this.wrapper.clientHeight / this.lineHeight) + (BUFFER_LINES * 2);

        if (this.viewportDivs.length !== neededDivs && !isNaN(neededDivs) && neededDivs > 0) {
            this.viewportDivs = [];
            this.viewport.innerHTML = '';
            for (let i = 0; i < neededDivs; i++) {
                const div = document.createElement('div');
                div.style.height = `${this.lineHeight}px`;
                this.viewport.appendChild(div);
                this.viewportDivs.push(div);
            }
        }

        this._render();
        this._updateCaret();
    },

    _render() {
        if (!this.lines || !this.lineHeight || !this.highlighterWorker) return;

        const scrollTop = this.textarea.scrollTop;
        const scrollLeft = this.textarea.scrollLeft;

        const BUFFER_LINES = 10;
        const firstVisibleLine = Math.floor(scrollTop / this.lineHeight);
        const firstLineToRender = Math.max(0, firstVisibleLine - BUFFER_LINES);

        this.currentFirstLine = firstLineToRender;
        const requestId = ++this.latestRequestId;

        this.highlighterWorker.postMessage({
            type: 'highlight',
            firstLineToRender: firstLineToRender,
            numLinesToRender: this.viewportDivs.length,
            requestId: requestId,
            scrollTopAtRequest: scrollTop,
            scrollLeftAtRequest: scrollLeft
        });
    },

    _onWorkerMessage(e) {
        const { type, htmlLines, requestId, responseFirstLine, scrollTopAtRequest, scrollLeftAtRequest } = e.data;

        if (type === 'highlightResult') {
            if (requestId < this.lastRenderedId) return;
            this.lastRenderedId = requestId;

            requestAnimationFrame(() => {
                htmlLines.forEach((html, i) => {
                    const div = this.viewportDivs[i];
                    if (div) {
                        if (html === null) {
                            div.style.display = 'none';
                        } else {
                            div.style.display = 'block';
                            if (div.innerHTML !== html) div.innerHTML = html;
                        }
                    }
                });

                // Perfect Scroll Sync
                const scrollRemainder = scrollTopAtRequest - (responseFirstLine * this.lineHeight);
                this.viewport.style.transform = `translate(${-scrollLeftAtRequest}px, ${-scrollRemainder}px)`;

                this.textarea.dispatchEvent(new CustomEvent('editor-rendered', { bubbles: true }));
            });
        }
    },
    
    _onScroll() {
        window.requestAnimationFrame(() => {
            this._render();
            // this._updateCaret(); 
        });
    }
};
