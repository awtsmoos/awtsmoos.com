// B"H
export function bufferAttributePacket(name, array = [], itemSize = 3) { return { name, array, itemSize, count:itemSize ? Math.floor(array.length / itemSize) : 0 }; }
