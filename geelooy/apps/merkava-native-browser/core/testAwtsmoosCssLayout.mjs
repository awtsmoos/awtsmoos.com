// B"H
import { buildMerkavaExecutorRenderStream } from "./merkavaExecutorRenderStream.js";

const html = `<!doctype html><html><head><style>
html,body{margin:0;height:100%;overflow:hidden;font-family:Arial,sans-serif}
header.awtsmoosificationalisticaticalism{background:#a3cbff;padding:10px 20px;height:25px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 1px 4px black}
.all.awtsmoospage{display:flex;flex-direction:column;height:100vh}
.all.awtsmoospage>.main{display:flex;flex-grow:1;overflow-y:auto;flex-direction:column}
.all.awtsmoospage>.main.centered{padding:26px;align-items:center}.all.awtsmoospage>.main.centered.y{justify-content:center}
.logo{width:80%;display:flex;height:calc(100vh - 100px);top:0;margin:0;overflow:hidden;align-items:center;justify-content:center;text-align:center;position:absolute;padding:20px 0;background-color:#f1f1f1;box-shadow:0 2px 4px rgb(0 0 0 / 10%)}
.logo img{height:100%}.about{padding:5px;box-shadow:inset -1px 4px 20px 20px azure,0 0 13px 3px black}
.awtsmoospage>footer{background-color:#f1f1f1;padding:10px 20px;height:60px;margin-top:auto;display:flex;justify-content:center;align-items:center}
.awtsmoospage>footer a{color:#4285f4;margin:0 10px;text-decoration:none}
.sidebarMitzvah{position:fixed;top:45px;left:100%;transform:translateX(-100%);width:250px;height:calc(100% - 45px);padding:20px;background:rgb(0 0 0 / 80%);color:#f0f0f0}
.sidebarMitzvah a{position:relative;display:block;padding:12px 0;color:#c7e4ff;font-weight:500;overflow:hidden}
.sidebarMitzvah a::after{content:"";position:absolute;bottom:0;left:0;height:2px;width:100%;background:linear-gradient(90deg,#00eaff,#0066ff);transform:translateX(-100%)}
.offscreen{transform:translateX(100%)}
</style></head><body><div class="all awtsmoospage"><header class="awtsmoosificationalisticaticalism"><div class="BH"><div class="lg">B"H</div></div><div class="header-buttons"><div class="menuBtn btn"></div></div></header><div class="sidebarMitzvah offscreen"><a>Awtsmoos Email</a><a>Awtsmoos Apps</a><a>Sefarim</a></div><div class="main centered y"><div class="logo"><img src="/logo.jpg"></div><div class="about">The Awtsmoos is constantly recreating all matter from His speech!</div></div><footer><a><img width="45px" src="/yt.png"></a><a>Contact Yackov Kaufer</a><a>AI Books</a></footer></div></body></html>`;

const result = await buildMerkavaExecutorRenderStream({ html, scripts: [], url: "https://awtsmoos.com" });
const lines = result.stream.split(/\n/).filter(Boolean);
const boxes = lines.filter(line => line.startsWith("BOX|")).map(parseLine);
const texts = lines.filter(line => line.startsWith("TEXT|")).map(parseLine);
const header = boxes.find(box => box.color === "#a3cbff");
const logo = boxes.find(box => box.color === "#f1f1f1" && box.y < 40 && box.w > 500);
const footer = boxes.find(box => box.color === "#f1f1f1" && box.y > 450);
const sidebar = boxes.find(box => box.color === "#000000" && box.x > 760);
if (!header || header.y !== 0 || header.h < 40) throw new Error("header CSS layout missing");
if (!logo || logo.x < 60 || logo.w < 550 || logo.h < 400) throw new Error("absolute centered logo geometry missing");
if (!footer || footer.y < 450 || footer.h < 70) throw new Error("footer flex/margin-auto geometry missing");
if (!sidebar) throw new Error("offscreen fixed sidebar transform missing");
if (!texts.some(text => text.text.includes("Awtsmoos is constantly"))) throw new Error("about text did not render");
if (boxes.length > 20) throw new Error("too many fake boxes rendered: " + boxes.length);
console.log(JSON.stringify({ ok: true, boxes: boxes.length, texts: texts.length, streamBytes: result.summary.streamBytes }, null, 2));

function parseLine(line) {
  const [kind, id, x, y, wOrText, hOrColor, color] = line.split("|");
  return kind === "BOX" ? { id, x: Number(x), y: Number(y), w: Number(wOrText), h: Number(hOrColor), color } : { id, x: Number(x), y: Number(y), text: wOrText, color: hOrColor };
}
