// B'H
export function updateStats(w,commands=0,pipe='direct'){const s=w.stats||(w.stats={frames:0,commands:0,chunks:0,cached:0,objects:0,pipe});s.frames++;s.commands=commands;s.objects=w.level.objects.length;s.chunks=w.level.streamer?.active.length||0;s.cached=w.level.streamer?.cached||0;s.pipe=pipe;return s}
export function statsText(w){const s=w.stats;if(!s)return '';return` · ${s.pipe} · chunks ${s.chunks}/${s.cached} · draws ${s.commands}`}
