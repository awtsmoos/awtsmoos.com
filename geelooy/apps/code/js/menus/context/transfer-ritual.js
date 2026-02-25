
// B"H
/**
 * @file transfer-ritual.js
 * @brief Manifesting the gathering and movement of data.
 */

/**
 * @class TransferRitual
 * @description Provides menu items for copying, downloading, and zipping.
 */
export const TransferRitual = {
    /**
     * @function getItems
     * @description Returns items related to data transfer and archival.
     */
    getItems(item) {
        const isFile = (item.kind === "file");
        return [
            { label: 'Copy Name', action: "copy-single", icon: "copy" },
            { label: "Copy Relative Path", action: "copy-relative-path", icon: "link" },
            { label: "Copy All as Markdown", action: "copy-all-contents", icon: "clipboard" },
            { label: "Download MD Context", action: "download-all-contents", icon: "download" },
            isFile ? 
                { label: "Download File", action: "download-file", icon: "download" } :
                { label: "Copy as ZIP", action: "copy-zip-single", icon: "save" },
            !isFile ? 
                { label: "Download ZIP", action: "download-zip-single", icon: "download" } : null
        ].filter(Boolean);
    }
};
