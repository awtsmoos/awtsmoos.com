// B\"H

export async function getPreviewControlScript() {
    const res = await fetch('/apps/code/js/html-preview/control/frame-client.js');
    if (!res.ok) throw new Error('Failed to load preview control client.');
    return await res.text();
}
