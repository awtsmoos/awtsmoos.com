
// B"H
/**
 * @file BlobForge.js
 * @brief Manifests ephemeral code into URI light.
 */

export const BlobForge = {
    solidify(content, mime = 'application/javascript') {
        console.log("[BlobForge] B\"H - Preparing to solidify code. Payload size: " + (content ? content.length : 0) + " bytes. MIME: " + mime);

        if (content === undefined || content === null) {
            console.error("[BlobForge] B\"H - FATAL: Attempted to solidify undefined content.");
            return null;
        }
        
        try {
            const blob = new Blob([content], { type: mime });
            const url = URL.createObjectURL(blob);
            
            console.log("%c[BlobForge] B\"H - Manifestation Successful! URL: " + url, "color: #a8ff00; font-weight: bold;");
            return url;
        } catch (e) {
            console.error("[BlobForge] B\"H - The Forge has shattered during solidification:", e);
            return null;
        }
    }
};
