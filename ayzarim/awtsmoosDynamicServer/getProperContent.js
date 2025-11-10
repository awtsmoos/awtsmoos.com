/**B"H */
module.exports = function getProperContent
(
    content = null,
    contentType = null,
    isBinary = false
) {
    // If it's a buffer, we still need to return the standard object format.
    // The content is the buffer itself, and the contentType is what was passed in.
    if (Buffer.isBuffer(content)) {
        return {
            content,
            contentType
        };
    }

    if (!isBinary) {
        if (typeof(content) == "boolean") {
            content += "";
        } else if (content && typeof(content) == "object") {
            contentType = "application/json"; // This part is fine.
            try {
                content = JSON.stringify(content);
            } catch (e) {
                content += "";
            }
        }
    }

    // Always return the consistent object structure.
    return {
        content,
        contentType
    };
}