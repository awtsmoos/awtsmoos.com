
/**
 * B"H
 * RNG Utility
 * 
 */

export default class RNG {
    constructor(seed) {
        this.m_w = (123456789 + seed) & 0xffffffff;
        this.m_z = (987654321 - seed) & 0xffffffff;
        this.mask = 0xffffffff;
    }

    random(max = 1, min = 0) {
        this.m_z = (36969 * (this.m_z & 65535) + (this.m_z >> 16)) & this.mask;
        this.m_w = (18000 * (this.m_w & 65535) + (this.m_w >> 16)) & this.mask;
        let result = ((this.m_z << 16) + (this.m_w & 65535)) >>> 0;
        result /= 4294967296;
        return (max - min) * result + min;
    }
}
