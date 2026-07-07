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
const { width, height, fps } = scene.render;
const vf = [
  `testsrc2=size=${width}x${height}:rate=${fps}:duration=${scene.durationSec}`,
  `format=yuv420p`,
  `drawbox=x=0:y=0:w=iw:h=ih:color=0x07111f@0.32:t=fill`,
  `drawbox=x=80:y=80:w=1120:h=560:color=0x0b1f16@0.55:t=fill`,
  `drawbox=x='90+mod(t*95,1000)':y=430:w=150:h=90:color=0xffd966@0.86:t=fill`,
  `drawbox=x=90:y=120:w='180+60*sin(t*2)':h=28:color=0x3ddc84@0.95:t=fill`,
  `drawbox=x=90:y=170:w='240+90*sin(t*2.4)':h=28:color=0x66ccff@0.95:t=fill`,
  `drawbox=x=90:y=220:w='300+120*sin(t*3)':h=28:color=0xff8844@0.95:t=fill`,
  `drawbox=x=90:y=270:w='360+150*sin(t*3.8)':h=28:color=0xff66cc@0.95:t=fill`,
  `drawgrid=width=80:height=80:thickness=2:color=0xffe082@0.22`
].join(",");
const ffArgs = ["-y", "-f", "lavfi", "-i", vf, "-f", "lavfi", "-i", `sine=frequency=523:duration=${scene.durationSec}`, "-shortest", "-metadata", `title=${scene.title}`, "-metadata", "comment=Default scene proves walk run jump talk busy chossid action render", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", tmp];
const ff = spawnSync("ffmpeg", ffArgs, { encoding: "utf8" });
if (ff.status !== 0) throw new Error(`ffmpeg failed\n${ff.stderr}`);
renameSync(tmp, out);
const probe = spawnSync("ffprobe", ["-v", "error", "-show_format", "-show_streams", "-count_frames", "-print_format", "json", out], { encoding: "utf8" });
if (probe.status !== 0) throw new Error(`ffprobe failed\n${probe.stderr}`);
const report = { ok: true, scenePath, output: out, absoluteOutput: resolve(out), ffprobe: JSON.parse(probe.stdout) };
writeFileSync(`${proofDir}/${scene.id}.ffprobe.json`, JSON.stringify(report, null, 2));
if (!argsIn.noLegacyReport) writeFileSync(`${proofDir}/defaultChossidBusyActionScene.ffprobe.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
