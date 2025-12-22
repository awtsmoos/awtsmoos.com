
// B"H
// FILE: js/coding/virtualized/metrics.js

export const MetricsMethods = {
    _measureAndRender() {
        const performMeasurements = () => {
            if (!this.textarea.parentNode || !this.textarea.clientWidth) return false;

            const computed = getComputedStyle(this.textarea);
            const lh = parseFloat(computed.lineHeight);
            if (!lh || isNaN(lh)) return false;

            // B"H - Enforce Integer Grid
            this.lineHeight = Math.round(lh);
            
            // Force aligned line-heights on both layers
            const lhPx = `${this.lineHeight}px`;
            this.textarea.style.lineHeight = lhPx;
            this.overlay.style.lineHeight = lhPx;

            // Measure Character Width (High Precision)
            const tempSpan = document.createElement('span');
            tempSpan.style.font = computed.font;
            tempSpan.style.fontFamily = computed.fontFamily; // Explicit
            tempSpan.style.whiteSpace = 'pre';
            tempSpan.style.position = 'absolute';
            tempSpan.style.visibility = 'hidden';
            tempSpan.textContent = '0'.repeat(100); 
            
            this.overlay.appendChild(tempSpan);
            const width100 = tempSpan.getBoundingClientRect().width;
            this.charWidth = width100 / 100;
            tempSpan.remove();
            
            return this.charWidth > 0 && this.lineHeight > 0;
        };

        let tried = 0;
        const attemptMeasure = () => {
            if (tried++ > 10) return;
            try {
                if (performMeasurements()) {
                    this._update();
                } else {
                    setTimeout(attemptMeasure, 50);
                }
            } catch(e) {}
        };
        attemptMeasure();
    },

    _handleKeyDown(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) this.unindentSelection();
            else this.indentSelection();
        }
    },

    indentSelection() {
        const { selectionStart, selectionEnd, value } = this.textarea;
        const lines = value.split('\n');
        const startLine = (value.substring(0, selectionStart).match(/\n/g) || []).length;
        const endLine = (value.substring(0, selectionEnd).match(/\n/g) || []).length;
        const tabChar = '\t'; 

        for (let i = startLine; i <= endLine; i++) {
            lines[i] = tabChar + lines[i];
        }

        const newValue = lines.join('\n');
        const newEnd = selectionEnd + (endLine - startLine + 1);

        this.textarea.value = newValue;
        this.textarea.selectionStart = selectionStart + 1;
        this.textarea.selectionEnd = newEnd;
        this._update();
    },

    unindentSelection() {
        const { selectionStart, selectionEnd, value } = this.textarea;
        const lines = value.split('\n');
        const startLine = (value.substring(0, selectionStart).match(/\n/g) || []).length;
        const endLine = (value.substring(0, selectionEnd).match(/\n/g) || []).length;
        
        let charsRemovedInFirstLine = 0;
        let totalCharsRemoved = 0;

        for (let i = startLine; i <= endLine; i++) {
            if (lines[i].startsWith('\t')) {
                lines[i] = lines[i].substring(1);
                if (i === startLine) charsRemovedInFirstLine = 1;
                totalCharsRemoved++;
            } else if (lines[i].startsWith('    ')) {
                const spacesToRemove = lines[i].match(/^(\s{1,4})/)[0].length;
                lines[i] = lines[i].substring(spacesToRemove);
                if (i === startLine) charsRemovedInFirstLine = spacesToRemove;
                totalCharsRemoved += spacesToRemove;
            }
        }

        const newValue = lines.join('\n');
        this.textarea.value = newValue;
        this.textarea.selectionStart = Math.max(0, selectionStart - charsRemovedInFirstLine);
        this.textarea.selectionEnd = Math.max(0, selectionEnd - totalCharsRemoved);
        this._update();
    }
};
