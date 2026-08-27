// B"H
const start = Date.now();

const log = (msg) => {
    const time = ((Date.now() - start) / 1000).toFixed(3);
    const mem = process.memoryUsage();
    // RSS: Resident Set Size (Total physical RAM)
    // Heap: JavaScript Objects
    const rss = (mem.rss / 1024 / 1024).toFixed(1);
    const heap = (mem.heapUsed / 1024 / 1024).toFixed(1);
    
    console.log(`B"H [${time}s] [JS: ${heap}MB | Total: ${rss}MB] ${msg}`);
};

const error = (msg) => {
    log(`[ERROR] ${msg}`);
};

module.exports = { log, error };