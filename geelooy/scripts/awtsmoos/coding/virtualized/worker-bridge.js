
// B"H
// FILE: js/coding/virtualized/worker-bridge.js

export const WorkerMethods = {
    _initializeHighlightingWorker() {
        try {
            if (!window.__awtsmoosSharedHighlighterWorker) {
                const shared = new Worker(new URL('../highlighter.worker.js', import.meta.url), { type: 'module' });
                const listeners = new Map();
                shared.onmessage = (e) => {
                    const clientId = e.data?.clientId;
                    if (!clientId) return;
                    const listener = listeners.get(clientId);
                    if (listener) listener(e);
                };
                shared.onerror = (e) => console.error("Worker Error:", e);
                window.__awtsmoosSharedHighlighterWorker = { worker: shared, listeners };
            }

            this.workerClientId = `bh_editor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            this.highlighterWorker = window.__awtsmoosSharedHighlighterWorker.worker;
            window.__awtsmoosSharedHighlighterWorker.listeners.set(this.workerClientId, this._onWorkerMessage.bind(this));

            this.highlighterWorker.postMessage({
                type: 'setText',
                clientId: this.workerClientId,
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
                clientId: this.workerClientId,
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
            clientId: this.workerClientId,
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

    _disposeWorkerBinding() {
        if (!this.workerClientId || !window.__awtsmoosSharedHighlighterWorker) return;
        window.__awtsmoosSharedHighlighterWorker.listeners.delete(this.workerClientId);
    },
    
    _onScroll() {
        window.requestAnimationFrame(() => {
            this._render();
            // this._updateCaret(); 
        });
    }
};
