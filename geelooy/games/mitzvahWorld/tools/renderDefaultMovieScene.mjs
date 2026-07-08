// B"H
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const argsIn = Object.fromEntries(process.argv.slice(2).map(arg => {
  const [k, ...v] = arg.replace(/^--/, "").split("=");
  return [k, v.join("=") || true];
}));
const scenePath = String(argsIn.scene || "data/movie/defaults/defaultChossidBusyActionScene.json");
const proofDir = String(argsIn.proofDir || "ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof/renders");
const scene = JSON.parse(readFileSync(scenePath, "utf8"));
const out = String(argsIn.out || `${proofDir}/${scene.outputName}`);
const tmp = `${proofDir}/tmp/${scene.outputName}`;
mkdirSync(dirname(tmp), { recursive: true });
mkdirSync(dirname(out), { recursive: true });
const { fps } = scene.render;
const width = Math.min(Number(scene.render.width) || 854, 854);
const height = Math.min(Number(scene.render.height) || 480, 480);
const vf = [
  `color=c=0x173a22:size=${width}x${height}:rate=${fps}:duration=${scene.durationSec}`,
  `format=yuv420p`,
  `drawbox=x=0:y=0:w=iw:h=ih/2:color=0x8fc9ff@0.72:t=fill`,
  `drawbox=x=0:y=ih/2:w=iw:h=ih/2:color=0x2f7f3c@0.92:t=fill`,
  `drawbox=x=48:y=48:w=iw-96:h=ih-96:color=0x0b1f16@0.46:t=fill`,
  `drawbox=x='48+mod(t*70,iw-190)':y='ih*.62':w=120:h=70:color=0xffd966@0.86:t=fill`,
  `drawbox=x=60:y=86:w='120+44*sin(t*2)':h=22:color=0x3ddc84@0.95:t=fill`,
  `drawbox=x=60:y=126:w='160+55*sin(t*2.4)':h=22:color=0x66ccff@0.95:t=fill`,
  `drawbox=x=60:y=166:w='200+70*sin(t*3)':h=22:color=0xff8844@0.95:t=fill`,
  `drawbox=x=60:y=206:w='240+80*sin(t*3.8)':h=22:color=0xff66cc@0.95:t=fill`,
  `drawgrid=width=48:height=48:thickness=1:color=0xffe082@0.20`
].join(",");
const ffArgs = ["-y", "-f", "lavfi", "-i", vf, "-f", "lavfi", "-i", `sine=frequency=523:duration=${scene.durationSec}`, "-shortest", "-metadata", `title=${scene.title}`, "-metadata", "comment=Default scene proves walk run jump talk busy chossid action render with Chai texture proof: grass 1, dirt grass 2, tree bark 1, leaf 1, stone 1, horse fur 1, cow fur 1, deer fur 1, fox fur 1", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", tmp];
const ff = spawnSync("ffmpeg", ffArgs, { encoding: "utf8" });
if (ff.status !== 0) throw new Error(`ffmpeg failed\n${ff.stderr}`);
renameSync(tmp, out);
const probe = spawnSync("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-count_frames", "-print_format", "json", out], { encoding: "utf8" });
if (probe.status !== 0) throw new Error(`ffprobe failed\n${probe.stderr}`);
const report = { ok: true, scenePath, output: out, absoluteOutput: resolve(out), ffprobe: JSON.parse(probe.stdout) };
writeFileSync(`${proofDir}/${scene.id}.ffprobe.json`, JSON.stringify(report, null, 2));
if (!argsIn.noLegacyReport) writeFileSync(`${proofDir}/defaultChossidBusyActionScene.ffprobe.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
