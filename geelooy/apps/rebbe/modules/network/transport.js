//B"H
// modules/network/transport.js

export async function fetchBlob(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Transport Error: ${res.statusText}`);
    return await res.blob();
}

export async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Transport Error: ${res.statusText}`);
    return await res.json();
}