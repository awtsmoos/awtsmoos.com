// B"H
// ========================================================================
// START: Intensely Robust Multipart Parser
// This replaces the previous parseMultipartFormData function entirely.
// ========================================================================

class MultipartParser {
    constructor(bodyBuffer, boundary) {
        this.body = bodyBuffer;
        this.boundary = Buffer.from('--' + boundary);
        this.boundaryEnd = Buffer.from('--' + boundary + '--');
        this.crlf = Buffer.from('\r\n');
        this.doubleCrlf = Buffer.from('\r\n\r\n');
        this.results = {};
        this.position = 0;
    }

    /**
     * Parses the disposition header string to extract attributes like name and filename.
     * Handles quoted strings and whitespace.
     * @param {string} headerValue - e.g., 'form-data; name="myFile"; filename="image.jpg"'
     * @returns {object} - e.g., { name: 'myFile', filename: 'image.jpg' }
     */
    _parseDispositionAttributes(headerValue) {
        const attributes = {};
        const parts = headerValue.split(';');
        for (let i = 1; i < parts.length; i++) { // Start at 1 to skip "form-data"
            const pair = parts[i].trim();
            const eqIndex = pair.indexOf('=');
            if (eqIndex !== -1) {
                let key = pair.slice(0, eqIndex).trim();
                let value = pair.slice(eqIndex + 1).trim();
                // Remove quotes from the value, if they exist
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                attributes[key] = value;
            }
        }
        return attributes;
    }

    /**
     * Finds the index of a buffer pattern within another buffer.
     * @param {Buffer} pattern - The buffer to search for.
     * @param {number} startPosition - The position to start searching from.
     * @returns {number} - The index of the pattern, or -1 if not found.
     */
    _find(pattern, startPosition = 0) {
        return this.body.indexOf(pattern, startPosition);
    }

    /**
     * The main execution method to parse the entire body.
     */
    parse() {
        // The first boundary should be at the very beginning of the buffer.
        let boundaryIndex = this._find(this.boundary, 0);
        if (boundaryIndex !== 0) {
            console.error("Awtsmoos Parser Warning: Malformed multipart body. Missing start boundary.");
            return {};
        }

        // Start searching for the next part right after the first boundary line.
        this.position = this.boundary.length + this.crlf.length;

        while (this.position < this.body.length) {
            // Find the start of the next boundary marker
            const nextBoundaryIndex = this._find(this.boundary, this.position);
            
            if (nextBoundaryIndex === -1) {
                // This could mean we've hit the end, or the data is truncated.
                console.error("Awtsmoos Parser Warning: Truncated multipart body. Missing final boundary.");
                break;
            }

            // The content of the current part is between our current position and the next boundary.
            // We must subtract the length of the preceding CRLF.
            const partContent = this.body.slice(this.position, nextBoundaryIndex - this.crlf.length);

            // Now, we process this part's buffer.
            const headerEndIndex = partContent.indexOf(this.doubleCrlf);
            if (headerEndIndex === -1) {
                // Malformed part, no headers. Skip it.
                this.position = nextBoundaryIndex + this.boundary.length + this.crlf.length;
                continue;
            }

            const headerBuffer = partContent.slice(0, headerEndIndex);
            const dataBuffer = partContent.slice(headerEndIndex + this.doubleCrlf.length);

            const headers = headerBuffer.toString().split('\r\n');
            let disposition = null;
            let contentType = 'application/octet-stream'; // Default

            for (const header of headers) {
                const lowerHeader = header.toLowerCase();
                if (lowerHeader.startsWith('content-disposition:')) {
                    disposition = this._parseDispositionAttributes(header.slice(20));
                } else if (lowerHeader.startsWith('content-type:')) {
                    contentType = header.slice(13).trim();
                }
            }

            if (disposition && disposition.name) {
                if (disposition.filename) {
                    // It's a file. Store the rich object with the raw Buffer.
                    this.results[disposition.name] = {
                        filename: disposition.filename,
                        contentType: contentType,
                        data: dataBuffer
                    };
                } else {
                    // It's a standard field. Store the string value.
                    this.results[disposition.name] = dataBuffer.toString();
                }
            }

            // Check if the boundary we just found is the final one.
            const potentialEndMarker = this.body.slice(nextBoundaryIndex, nextBoundaryIndex + this.boundaryEnd.length);
            if (potentialEndMarker.equals(this.boundaryEnd)) {
                // We are done.
                break;
            }

            // Move position to the start of the next part.
            this.position = nextBoundaryIndex + this.boundary.length + this.crlf.length;
        }

        return this.results;
    }
}

/**
 * Public-facing function that instantiates and runs the robust parser.
 * This is the function that your `getData` method will call.
 * @param {Buffer} bodyBuffer The entire request body as a single Buffer.
 * @param {string} boundary The boundary string from the Content-Type header.
 * @returns {Object} The parsed form data.
 */
function parseMultipartFormData(bodyBuffer, boundary) {
    if (!bodyBuffer || bodyBuffer.length === 0 || !boundary) {
        return {};
    }
    try {
        const parser = new MultipartParser(bodyBuffer, boundary);
        return parser.parse();
    } catch (error) {
        console.error("Awtsmoos Multipart Parser CRITICAL FAILURE:", error);
        return {}; // Return empty object on catastrophic failure.
    }
}
module.exports = {
	parseMultipartFormData,
	MultipartParser 
}
// ========================================================================
// END: Intensely Robust Multipart Parser
// ========================================================================