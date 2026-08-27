// B"H
/**
 * @file makomChafshee.js
 * @description "The Free Place" - Managing the linked pages of the void.
 * FIXED: Explicit VarInt sizing in serialization.
 */

const { writeConditional, packedLength, unpackLength } = require("./binaryHelpers.js");
const fs = require('fs');

const MAX_ENTRIES_PER_PAGE = 50; 
const PAGE_MAGIC = "VOID";

function log(msg) {
    try { fs.writeSync(2, `\x1b[35mB"H [MAKOM_CHAFSHEE] ${msg}\x1b[0m\n`); } catch(e) {}
}

function updateSortedFreeSpaceAcrossMetadata(metadata, options = {}) {
    const { buffer, entry, initialNextAvailablePageOffset } = options;

    if (!buffer || !Array.isArray(metadata) || !metadata.length) {
        return { metadata, newEndOfDataAndPages: initialNextAvailablePageOffset };
    }
    if (!entry || entry.size <= 0) {
        return { metadata, newEndOfDataAndPages: initialNextAvailablePageOffset };
    }

    let state = {
        buffer,
        pendingBlocks: [ { ...entry } ], 
        nextAvailOffset: initialNextAvailablePageOffset,
        currentHead: (metadata[0] && metadata[0].freeSpacePageOffset) ? metadata[0].freeSpacePageOffset : 0,
        
        updateHead: (newOffset) => {
            if (metadata[0]) metadata[0].freeSpacePageOffset = newOffset;
            state.currentHead = newOffset;
        }
    };

    let safety = 0;
    while (state.pendingBlocks.length > 0 && safety < 1000) {
        const block = state.pendingBlocks.shift();
        _insertIntoChain(state, block, state.currentHead, (newPtr) => state.updateHead(newPtr));
        safety++;
    }
    
    return { metadata, newEndOfDataAndPages: state.nextAvailOffset };
}

function _insertIntoChain(state, block, pageOffset, linkUpdater) {
    if (!pageOffset) {
        const serialized = _serializePage({ entries: [block], nextPage: 0 });
        const pos = state.nextAvailOffset;
        state.nextAvailOffset += serialized.length;
        state.buffer.writeBuffer(pos, serialized);
        linkUpdater(pos);
        return;
    }

    const parsed = _loadPage(state.buffer, pageOffset);
    if (parsed.error) {
        _insertIntoChain(state, block, 0, linkUpdater);
        return;
    }

    let entries = [...parsed.entries];
    let inserted = false;
    for (let i = 0; i < entries.length; i++) {
        if (block.size <= entries[i].size) {
            entries.splice(i, 0, block);
            inserted = true;
            break;
        }
    }
    if (!inserted) entries.push(block);

    if (entries.length > MAX_ENTRIES_PER_PAGE) {
        const mid = Math.ceil(entries.length / 2);
        const p1 = entries.slice(0, mid);
        const p2 = entries.slice(mid);
        state.pendingBlocks.push({ offset: pageOffset, size: parsed.pageSize });

        const s2 = _serializePage({ entries: p2, nextPage: parsed.nextPage });
        const off2 = state.nextAvailOffset;
        state.nextAvailOffset += s2.length;
        state.buffer.writeBuffer(off2, s2);

        const s1 = _serializePage({ entries: p1, nextPage: off2 });
        const off1 = state.nextAvailOffset;
        state.nextAvailOffset += s1.length;
        state.buffer.writeBuffer(off1, s1);

        linkUpdater(off1);
    } else {
        const s = _serializePage({ entries, nextPage: parsed.nextPage });
        if (s.length <= parsed.pageSize) {
            state.buffer.writeBuffer(pageOffset, s);
            const diff = parsed.pageSize - s.length;
            if (diff > 16) state.pendingBlocks.push({ offset: pageOffset + s.length, size: diff });
        } else {
            state.pendingBlocks.push({ offset: pageOffset, size: parsed.pageSize });
            const pos = state.nextAvailOffset;
            state.nextAvailOffset += s.length;
            state.buffer.writeBuffer(pos, s);
            linkUpdater(pos);
        }
    }
}

function _serializePage({ entries, nextPage }) {
    const countData = writeConditional(entries.length);
    const nextData = writeConditional(nextPage);
    let mO = 0; let mS = 0;
    for (const e of entries) {
        if (e.offset > mO) mO = e.offset;
        if (e.size > mS) mS = e.size;
    }
    const oLen = writeConditional(mO).size;
    const sLen = writeConditional(mS).size;
    const hByte = (packedLength(oLen) << 6) | (packedLength(sLen) << 4) | (packedLength(countData.size) << 2) | (packedLength(nextData.size));
    
    const head = Buffer.concat([Buffer.from(PAGE_MAGIC), Buffer.from([hByte]), countData.buffer]);
    const body = Buffer.alloc(entries.length * (oLen + sLen));
    let cursor = 0;
    for (const e of entries) {
        body.writeUIntBE(e.offset, cursor, oLen); cursor += oLen;
        body.writeUIntBE(e.size, cursor, sLen); cursor += sLen;
    }
    return Buffer.concat([head, body, nextData.buffer]);
}

function _loadPage(buffer, offset) {
    try {
        let cursor = offset;
        const magic = buffer.readBuffer(cursor, cursor + 4).toString();
        if (magic !== PAGE_MAGIC) throw new Error("Magic mismatch");
        cursor += 4;
        const hByte = buffer.readUInt8(cursor++);
        const oL = unpackLength((hByte >> 6) & 3);
        const sL = unpackLength((hByte >> 4) & 3);
        const cL = unpackLength((hByte >> 2) & 3);
        const nL = unpackLength(hByte & 3);
        const count = buffer.readUIntBE(cursor, cL); cursor += cL;
        const entries = [];
        for (let i = 0; i < count; i++) {
            const off = buffer.readUIntBE(cursor, oL); cursor += oL;
            const sz = buffer.readUIntBE(cursor, sL); cursor += sL;
            entries.push({ offset: off, size: sz });
        }
        const nextPage = buffer.readUIntBE(cursor, nL); cursor += nL;
        return { entries, nextPage, pageSize: cursor - offset };
    } catch (e) { return { error: e }; }
}

module.exports = { updateSortedFreeSpaceAcrossMetadata };