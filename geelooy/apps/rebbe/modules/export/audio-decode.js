//B"H
// modules/export/audio-decode.js

export async function decodeBlobToAudioBuffer(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    try {
        return await ctx.decodeAudioData(arrayBuffer.slice(0));
    } finally {
        await ctx.close().catch(() => {});
    }
}
