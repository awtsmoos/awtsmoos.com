//B"H
module.exports = {
    blockHeaderSize: (blockIdByteSize) => 
        blockIdByteSize * 2 + 1,
    superBlockNextFreeOffset: 4 + 2 + 1 + 1 + 1

}