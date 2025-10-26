/**
 * @ B"H 
 * @file VirtualizedEditor.js
 * @version 6.0.0 - Olam HaBeriah (The World of Creation)
 *
 * @description
 * This is the final, perfected architecture. The Guf (Body) and Neshama (Soul) are now
 * created in their own separate, well-defined realms (files). The Body on the main
 * thread is clean and focused. The Soul in the worker file is pure logic. This
 * sacred separation is achieved through a modern module-aware worker loader,
 * eliminating all brittleness and syntax conflicts of the past.
 *
 * This file represents the Guf (Body). Its sole responsibilities are:
 * 1. Managing the DOM and user events.
 * 2. Communicating with the Neshama (the highlighting worker).
 * 3. Ensuring a perfectly fluid and responsive user experience in the world of action.
 */

/**
 * @function makeQuickWorker
 * @description The Sefirah of Binah (Understanding). Offloads quick, ephemeral tasks.
 * This is preserved for its utility in handling discrete, non-stateful computations.
 */
function makeQuickWorker(fnc, ...args) {
	return new Promise((resolve, reject) => {
		if (typeof fnc !== 'function') return reject(new Error("The spark must be a function."));
		let stringed;
		try {
			stringed = JSON.stringify(args);
		} catch (e) {
			return reject(e);
		}
		const txt = `var task=${fnc};var args=${stringed};self.onmessage=async e=>{if(e.data.go)try{postMessage({got:await task(...args)})}catch(t){postMessage({error:t.message})}};postMessage({started:!0});`;
		const wk = new Worker(URL.createObjectURL(new Blob([txt], {
			type: "application/javascript"
		})));
		wk.onmessage = e => {
			if (e.data.started) wk.postMessage({
				go: !0
			});
			if (e.data.got) {
				resolve(e.data.got);
				wk.terminate();
			}
			if (e.data.error) {
				reject(new Error(e.data.error));
				wk.terminate();
			}
		};
		wk.onerror = e => {
			reject(new Error(e.message));
			wk.terminate();
		}
	});
}


class VirtualizedEditor {
	/**
	 * @constructor
	 * @description The moment of creation. A body is formed and its soul is summoned from a separate realm.
	 */
	constructor(textarea, language = 'js', customColors = {}) {
		if (!textarea || textarea.tagName !== 'TEXTAREA') {
			throw new Error('The vessel of creation must be a TEXTAREA element.');
		}

		this.textarea = textarea;
		this.language = language;
		
		// The Body is now aware of its current rendered state.
    this.currentFirstLine = 0;
    
		
		this.latestRequestId = 0;
        this.lastRenderedId = -1;
        
		this.wrapper = null;
		this.overlay = null;
		this.viewport = null;
		this.caret = null;
		this.styleId = `BH_EDITOR_${Date.now()}`;

		// State vessels
		this.lines = [];
		this.lineHeight = 0;
		this.charWidth = 0;
		this.viewportDivs = [];
		this.highlighterWorker = null; // The vessel for the persistent soul (main worker)

		// Color definitions
		const defaultColors = {
			comment: '#6A9555',
			string: '#CE9178',
			number: '#B5CEA8',
			controlKeyword: '#C586C0',
			definitionKeyword: '#569CD6',
			functionName: '#DCDCAA',
			variable: '#9CDCFE',
			operator: '#D4D4D4',
			punctuation: '#808080',
			tag: '#569CD6',
			'attribute-name': '#9CDCFE',
			'attribute-value': '#CE9178',
			selector: '#D7BA7D',
			property: '#9CDCFE',
		};
		this.colors = {
			...defaultColors,
			...customColors
		};

		// The sacred chain of creation
		this._initializeVessels();
		this._initializeHighlightingWorker(); // Give birth to the soul from its own realm
		this._attachEventListeners();
		this._measureAndRender();
	}

	// --- 1. THE BODY (Guf/Keli): HIGH-PERFORMANCE MAIN THREAD ARCHITECTURE ---

	/** @private @function _initializeVessels - Structures the DOM. */
	_initializeVessels() {
		const computed = window.getComputedStyle(this.textarea);
		this.wrapper = document.createElement('div');
		this.wrapper.className = 'virtualized-editor-wrapper';
		['width', 'height', 'margin', 'padding', 'border', 'boxSizing', 'position'].forEach(prop => {
			if (prop === 'position' && computed[prop] === 'static') this.wrapper.style.position = 'relative';
			else this.wrapper.style[prop] = computed[prop];
		});
		this.textarea.parentNode.insertBefore(this.wrapper, this.textarea);
		this.wrapper.appendChild(this.textarea);
		Object.assign(this.textarea.style, {
			position: 'absolute',
			top: '0',
			left: '0',
			width: '100%',
			height: '100%',
			resize: 'none',
			color: 'transparent',
			background: 'transparent',
			caretColor: '#66ff77',
			WebkitTextFillColor: 'transparent'
		});
		this.overlay = document.createElement('div');
		this.viewport = document.createElement('div');
		this.overlay.appendChild(this.viewport);
		Object.assign(this.overlay.style, {
			position: "absolute",
			zIndex: -1,
			top: '0',
			left: '0',
			width: '100%',
			height: '100%',
			pointerEvents: 'none',
			overflow: 'hidden',
			font: computed.font,
			padding: computed.padding,
			border: computed.border,
			boxSizing: computed.boxSizing
		});
		this.viewport.style.whiteSpace = "pre";
		this.caret = document.createElement('div');
		this.caret.className = 'virtualized-editor-caret';
		this.overlay.appendChild(this.caret);
		this.wrapper.insertBefore(this.overlay, this.textarea);
		this._applyColors();
	}

	/** @private @function _applyColors - Injects the dynamic CSS styles. */
	_applyColors() {
		const styleEl = document.createElement("style");
		styleEl.id = this.styleId + "-style";
		const caretColor = getComputedStyle(this.textarea).caretColor || 'white';
		styleEl.innerHTML = /*css*/`
		virtualized-editor-wrapper textarea::selection {
            background-color: transparent;
        }
        .virtualized-editor-wrapper textarea::-moz-selection { /* For Firefox */
            background-color: transparent;
        }
		
            .token-comment { color: ${this.colors.comment}; } .token-string { color: ${this.colors.string}; }
            .token-number { color: ${this.colors.number}; } .token-controlKeyword { color: ${this.colors.controlKeyword}; font-style: italic; }
            .token-definitionKeyword { color: ${this.colors.definitionKeyword}; } .token-functionName { color: ${this.colors.functionName}; }
            .token-variable { color: ${this.colors.variable}; } .token-operator { color: ${this.colors.operator}; }
            .token-punctuation { color: ${this.colors.punctuation}; } .token-tag { color: ${this.colors.tag}; }
            .token-attribute-name { color: ${this.colors['attribute-name']}; } .token-attribute-value { color: ${this.colors['attribute-value']}; }
            .token-selector { color: ${this.colors.selector}; } .token-property { color: ${this.colors.property}; }
            .virtualized-editor-caret { position: absolute; display: none; background-color: ${caretColor}; width: 1px; animation: blink 1s steps(1) infinite; z-index: 10; pointer-events: none; }
            @keyframes blink { 50% { background-color: transparent; } }
        `;
		document.head.querySelector("#" + styleEl.id)?.remove();
		document.head.appendChild(styleEl);
	}

	/** @private @function _attachEventListeners - Listens for user actions. */
	_attachEventListeners() {
		this.textarea.addEventListener('input', () => this._update());

		const onScroll = () => window.requestAnimationFrame(() => {
			this._render();
			this._updateCaret();
		});
		const onCaretMove = () => window.requestAnimationFrame(() => this._updateCaret());

		new ResizeObserver(onScroll).observe(this.wrapper);
		this.textarea.addEventListener('scroll', onScroll);
		['click', 'keyup', 'keydown', 'focus', 'blur'].forEach(evt => this.textarea.addEventListener(evt, onCaretMove));
	}

	/** @private @function _measureAndRender - Performs initial measurements. */
	_measureAndRender() {
		const performMeasurements = () => {
			if (!this.textarea.parentNode || !this.textarea.clientWidth) return false;
			if (!this.lineHeight) {
				const lh = parseFloat(getComputedStyle(this.textarea).lineHeight);
				if (lh && !isNaN(lh)) this.lineHeight = lh;
				else return false;
			}
			if (!this.charWidth) {
				const tempSpan = document.createElement('span');
				tempSpan.style.font = getComputedStyle(this.textarea).font;
				tempSpan.textContent = 'm';
				this.overlay.appendChild(tempSpan);
				this.charWidth = tempSpan.getBoundingClientRect().width;
				tempSpan.remove();
			}
			return this.charWidth > 0 && this.lineHeight > 0;
		};
		const attemptMeasure = () => {
			if (performMeasurements()) {
				this._update();
			} else {
				setTimeout(attemptMeasure, 50); // Retry if not yet in DOM
			}
		}
		attemptMeasure();
	}

	/** @private @async @function _update - Prepares state and triggers a render. */
	/** @private @async @function _update - Prepares state and triggers a render. */
/** @private @async @function _update - Prepares state and triggers a render. */
async _update() {
    const txt = this.textarea.value;
    try {
        this.lines = await makeQuickWorker(val => val.split("\n"), txt);
    } catch (e) {
        console.error("Quick worker failed for line splitting, falling back.", e);
        this.lines = txt.split("\n");
    }

    // --- CHANGE IS HERE ---
    // Define how many extra lines to render above and below the viewport.
    const BUFFER_LINES = 10; 
    
    // Calculate the total number of divs needed: visible lines + top buffer + bottom buffer.
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
}


/**
 * @private @function _render
 * @description Gathers scroll state and dispatches a request to the worker.
 * It NO LONGER manipulates the DOM to prevent race conditions.
 */
_render() {
    if (!this.lines || !this.lineHeight || !this.highlighterWorker) return;

    const scrollTop = this.textarea.scrollTop;
    const scrollLeft = this.textarea.scrollLeft;

    const BUFFER_LINES = 10;
    const firstVisibleLine = Math.floor(scrollTop / this.lineHeight);
    const firstLineToRender = Math.max(0, firstVisibleLine - BUFFER_LINES);

    // This is still important for discarding wildly out-of-date responses.
    this.currentFirstLine = firstLineToRender;
    
    const requestId = ++this.latestRequestId;

    // --- CRITICAL CHANGE ---
    // We now send the EXACT scrollTop and scrollLeft at the moment of the request.
    this.highlighterWorker.postMessage({
        type: 'highlight',
        text: this.textarea.value,
        language: this.language,
        firstLineToRender: firstLineToRender,
        numLinesToRender: this.viewportDivs.length,
        requestId: requestId,
        // Send the exact scroll coordinates with the request.
        scrollTopAtRequest: scrollTop,
        scrollLeftAtRequest: scrollLeft
    });
}


	/** @private @function _updateCaret - Positions the simulated caret. */
	_updateCaret() {
		if (document.activeElement !== this.textarea || !this.lineHeight || !this.charWidth) {
			if (this.caret) this.caret.style.display = 'none';
			return;
		}
		this.caret.style.display = 'block';
		const cursorIdx = this.textarea.selectionStart;
		let lineIdx = 0,
			colIdx = 0,
			count = 0;
		for (let i = 0; i < this.lines.length; i++) {
			const lineLength = this.lines[i].length + 1;
			if (count + lineLength > cursorIdx) {
				lineIdx = i;
				colIdx = cursorIdx - count;
				break;
			}
			count += lineLength;
		}
		const caretX = colIdx * this.charWidth;
		const caretY = lineIdx * this.lineHeight;
		this.caret.style.transform = `translate(${caretX - this.textarea.scrollLeft}px, ${caretY - this.textarea.scrollTop}px)`;
		this.caret.style.height = `${this.lineHeight}px`;
	}

	// --- 2. THE SOUL (Neshama/Ohr): WORKER CREATION AND COMMUNICATION ---

	/**
	 * @private @function _initializeHighlightingWorker
	 * @description Summons the soul from its separate realm (`highlighter.worker.js`).
	 */
	_initializeHighlightingWorker() {
		try {
			// The modern, bundler-friendly way to load a worker from an external file.
			this.highlighterWorker = new Worker(new URL('./highlighter.worker.js', import.meta.url), {
				type: 'module'
			});
			this.highlighterWorker.onmessage = this._onWorkerMessage.bind(this);
			this.highlighterWorker.onerror = (e) => console.error("Error from highlighting worker:", e);
		} catch (e) {
			console.error("Failed to initialize the highlighting worker. Highlighting will be disabled.", e);
		}
	}

/**
 * @private @function _onWorkerMessage
 * @description The final arbiter of reality. It receives content AND the exact
 * scroll coordinates from the time of request. It performs the painting and
 * positioning in a single, atomic operation, eliminating all jitter.
 */
_onWorkerMessage(e) {
    const { 
        type, 
        htmlLines, 
        requestId, 
        responseFirstLine,
        // --- RECEIVE THE ORIGINAL SCROLL COORDINATES ---
        scrollTopAtRequest,
        scrollLeftAtRequest
    } = e.data;

    if (type === 'highlightResult') {
        if (requestId < this.lastRenderedId) {
            return; 
        }

        // The check for relevance is still useful for very large, fast scrolls.
        const distance = Math.abs(responseFirstLine - this.currentFirstLine);
        if (distance > this.viewportDivs.length) {
             return; // Discard if the user has scrolled far, far away.
        }

        this.lastRenderedId = requestId;

        requestAnimationFrame(() => {
            // 1. Paint the content.
            htmlLines.forEach((html, i) => {
                const div = this.viewportDivs[i];
                if (div) {
                    if (html === null) {
                        div.style.display = 'none';
                    } else {
                        div.style.display = 'block';
                        if (div.innerHTML !== html) {
                           div.innerHTML = html;
                        }
                    }
                }
            });

            // 2. Position the content.
            // Calculate the remainder using the scrollTop from the moment of the request.
            const scrollRemainder = scrollTopAtRequest - (responseFirstLine * this.lineHeight);
            
            // Set the transform AT THE SAME TIME as the content is updated.
            this.viewport.style.transform = `translate(${-scrollLeftAtRequest}px, ${-scrollRemainder}px)`;
        });
    }
}

	// --- 3. PUBLIC API ---

	/** Updates the editor's content programmatically. */
	update(newContent) {
		if (typeof newContent !== 'string' || newContent === this.textarea.value) return;
		this.textarea.value = newContent;
		this._update();
	}

	/** Changes the language for syntax highlighting. */
	setLanguage(newLanguage) {
		if (typeof newLanguage !== 'string') return;
		this.language = newLanguage;
		this._update();
	}

	/** Cleans up the editor and restores the original textarea. */
	destroy() {
		if (this.highlighterWorker) {
			this.highlighterWorker.terminate();
		}
		if (this.wrapper && this.wrapper.parentNode) {
			this.wrapper.parentNode.insertBefore(this.textarea, this.wrapper);
			this.wrapper.remove();
		}
		this.textarea.style.cssText = "";
		const style = document.head.querySelector("#" + this.styleId + "-style");
		if (style) {
			style.remove();
		}
	}
}

export default VirtualizedEditor;