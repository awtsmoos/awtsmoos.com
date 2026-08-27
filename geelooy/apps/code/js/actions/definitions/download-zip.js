
// B"H
/**
 * @file download-zip.js
 */

import { ActionModal } from '../utils/modal.js';

export const DownloadZipAction = {
    async run() {
        console.log("B\"H - Download ZIP: Intent recognized.");
        ActionModal.alert("B\"H\nDownload ZIP functionality is gathering the fragments.");
    }
};
