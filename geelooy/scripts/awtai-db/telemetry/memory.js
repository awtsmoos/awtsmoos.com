// B"H
function sample(label) {
  const m = process.memoryUsage();
  return { label, rss: m.rss, heapTotal: m.heapTotal, heapUsed: m.heapUsed, external: m.external, arrayBuffers: m.arrayBuffers || 0 };
}

class MemoryTrace {
  constructor(){ this.samples=[]; this.maxRss=0; }
  mark(label){ const s=sample(label); this.samples.push(s); if(s.rss>this.maxRss)this.maxRss=s.rss; return s; }
  summary(){ return { maxRss:this.maxRss, sampleCount:this.samples.length, samples:this.samples.slice(-20) }; }
}

module.exports={sample,MemoryTrace};
