// B"H
// FILE: js/git-sha-calculator.js

/**
 * Calculates a SHA-1 hash for a string or Uint8Array in the exact same way Git does for its "blob" objects.
 * This is crucial for accurately comparing local file content with the remote repository's state.
 * @param {string|Uint8Array} content - The content of the file.
 * @returns {Promise<string>} - The calculated 40-character hexadecimal SHA-1 hash.
 */
export async function calculateGitBlobSha(content) {
    let contentBytes;
     
    if (typeof content === 'string') {
        const encoder = new TextEncoder();
        contentBytes = encoder.encode(content);
    } else if (content instanceof Uint8Array) {
        contentBytes = content;
    } else if (content instanceof ArrayBuffer) {
        contentBytes = new Uint8Array(content);
    } else {
        // Fallback or error
        throw new Error("Unsupported content type for SHA calculation");
    }

    // 1. Git requires a specific header format: "blob <content.length>\0"
    const encoder = new TextEncoder();
    const header = `blob ${contentBytes.length}\0`;
    const headerBytes = encoder.encode(header);

    // 2. Concatenate the header and the file content into a single byte array.
    const finalBytes = new Uint8Array(headerBytes.length + contentBytes.length);
    finalBytes.set(headerBytes);
    finalBytes.set(contentBytes, headerBytes.length);

    // 3. Use the browser's built-in cryptographic library to calculate the SHA-1 hash.
    const hashBuffer = await crypto.subtle.digest('SHA-1', finalBytes);

    // 4. Convert the resulting hash buffer into a hexadecimal string.
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}