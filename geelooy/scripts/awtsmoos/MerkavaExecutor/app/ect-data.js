// B"H
(function ectData(root) {
  const ect = root.AwtsECT = root.AwtsECT || {};

  /** B"H. Example projects are only seed text. Every compile packs current text live. */
  ect.projects = [
    project(0, "Bit Garden Project", "dom", gardenFiles()),
    project(1, "Dashboard Many Files", "dom", dashboardFiles()),
    project(2, "Virtual WebGL Touch Ball", "canvas", ballFiles()),
    project(3, "Plain HTML CSS JS", "dom", plainFiles()),
    project(4, "CSS Value Kitchen", "dom", kitchenFiles()),
    project(5, "Repeated Article List", "dom", articleFiles()),
    project(6, "Product Grid", "dom", cardGridFiles("product", 16)),
    project(7, "Photo Gallery", "dom", cardGridFiles("photo", 20)),
    project(8, "Pricing Table", "dom", pricingFiles()),
    project(9, "Todo Micro App", "dom", todoFiles()),
    project(10, "Nested Navigation", "dom", navFiles()),
    project(11, "Form Wizard", "dom", formFiles()),
    project(12, "CSS Animation Lab", "dom", animationFiles()),
    project(13, "SVG Icon Wall", "dom", svgFiles()),
    project(14, "Canvas Particles", "canvas", particlesFiles())
  ];

  function project(id, title, kind, files) { return { id, title, kind, precompiled: false, files }; }

  function gardenFiles() { return { "index.html": `<article class="card"><h2>Awtsmoos Bit Garden</h2><p>Every logical bit is counted. Fields share bytes.</p><button id="ignite">Ignite</button><output id="spark">waiting...</output></article>`, "styles.css": `.card{padding:28px;border-radius:24px;background:linear-gradient(135deg,#08111f,#14383a);color:#eaffff}.card h2{color:#73fff2}.card button{border:0;border-radius:999px;padding:10px 16px;background:#73fff2;color:#001;font-weight:900}.card output{display:block;margin-top:16px}`, "app.js": `const spark=document.getElementById("spark");const button=document.getElementById("ignite");let count=0;button.addEventListener("click",()=>requestAnimationFrame(()=>{count++;spark.textContent="B'H exact bit pulse #"+count;}));` }; }

  function dashboardFiles() { const cards = Array.from({ length: 24 }, (_, i) => `<li><b>vessel ${i + 1}</b><span>${(i + 3) * 7} sparks</span></li>`).join(""); return { "index.html": `<section class="dash"><h2>Awtsmoos Control Constellation</h2><p>Repeated cards become a recipe discovered on the spot.</p><ul>${cards}</ul><button id="ignite">Rotate Count</button><output id="spark">dashboard waiting</output></section>`, "layout.css": `.dash{padding:24px;border-radius:24px;background:#071923;color:#eaffff}.dash ul{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0}.dash li{list-style:none;padding:12px;border-radius:14px;background:#0d3340}.dash b,.dash span{display:block}.dash button{padding:10px 16px;border-radius:999px;border:0;background:#73fff2;font-weight:900}`, "behavior.js": `let n=0;document.getElementById("ignite").onclick=()=>{n++;document.getElementById("spark").textContent="dashboard pulse #"+n;};` }; }

  function ballFiles() { return { "index.html": `<section class="stage"><h2>WebGL Touch Ball</h2><p>Pointer controlled RAM canvas.</p><canvas id="stage" width="560" height="320"></canvas><output id="spark">touch canvas</output></section>`, "styles.css": `.stage{padding:24px;border-radius:24px;background:#06141f;color:#eaffff}.stage canvas{width:100%;border-radius:18px;background:#02050a;touch-action:none}.stage output{display:block;margin-top:12px;color:#73fff2}`, "app.js": `/* lowered to OP_CANVAS_BALL */` }; }

  function plainFiles() { return { "page.html": `<main class="plain"><h1>Plain Scroll</h1><p>Mostly ordinary source.</p><nav><a href="#a">Alef</a><a href="#b">Beis</a><a href="#g">Gimel</a></nav><output id="spark">ready</output></main>`, "plain.css": `.plain{font-family:serif;padding:32px;background:#fafafa;color:#111}.plain h1{font-size:42px}.plain p{line-height:1.7}.plain nav{display:flex;gap:12px}.plain a{color:#045;border-bottom:1px solid currentColor}`, "plain.js": `document.getElementById("spark").textContent="plain semantic fallback ready";` }; }

  function kitchenFiles() { return { "kitchen.html": `<section class="kitchen"><h2>CSS Typed Values</h2><div class="box">dimensions, colors, gradients, shadows, transforms</div><output id="spark">CSS is typed meaning, not text.</output></section>`, "kitchen.css": `.kitchen{padding:30px;background:linear-gradient(120deg,#102,#024);color:white}.box{margin:20px;padding:18px;border-radius:20px;box-shadow:0 20px 60px #0008;transform:rotate(-1deg) scale(1.02);background:#73fff2;color:#001;font-weight:800}`, "kitchen.js": `document.getElementById("spark").textContent="typed CSS value demo ready";` }; }

  function articleFiles() { const rows = Array.from({ length: 10 }, (_, i) => `<article class="row"><h3>Chapter ${i + 1}</h3><p>The same semantic shell repeats with a new number.</p></article>`).join(""); return { "articles.html": `<section class="articles"><h2>Repeated Article List</h2>${rows}<output id="spark">articles ready</output></section>`, "articles.css": `.articles{padding:22px;background:#081520;color:#eef}.row{margin:12px 0;padding:14px;border-radius:16px;background:#102c38}.row h3{margin:0 0 8px;color:#75fff2}.row p{margin:0;line-height:1.6}`, "articles.js": `document.getElementById("spark").textContent="article list rendered";` }; }

  function cardGridFiles(kind, count) { const cards = Array.from({ length: count }, (_, i) => `<article class="tile"><h3>${kind} ${i + 1}</h3><p>Repeated ${kind} description with shared shape and local number.</p><button>Open</button></article>`).join(""); return { [`${kind}.html`]: `<section class="grid"><h2>${kind} grid</h2>${cards}<output id="spark">${kind} grid ready</output></section>`, [`${kind}.css`]: `.grid{padding:24px;background:#071923;color:#eaffff}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.tile{padding:14px;border-radius:18px;background:#0d3340}.tile button{border:0;border-radius:999px;padding:8px 12px;background:#73fff2;color:#001}`, [`${kind}.js`]: `document.getElementById("spark").textContent="${kind} grid rendered";` }; }

  function pricingFiles() { const tiers = ["small", "medium", "large", "infinite"].map((t, i) => `<article class="plan"><h3>${t}</h3><b>$${(i + 1) * 9}</b><p>Includes ${i + 2} rivers of light.</p><button>Choose</button></article>`).join(""); return { "pricing.html": `<section class="pricing"><h2>Pricing Table</h2>${tiers}<output id="spark">pricing ready</output></section>`, "pricing.css": `.pricing{padding:24px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px;background:#06141f;color:#fff}.plan{padding:18px;border-radius:20px;background:#112f3a}.plan b{font-size:36px;color:#73fff2}.plan button{padding:10px 16px;border-radius:999px}`, "pricing.js": `document.getElementById("spark").textContent="pricing rendered";` }; }

  function todoFiles() { return { "todo.html": `<section class="todo"><h2>Todo Micro App</h2><input id="newItem" value="learn bytecode"><button id="ignite">Add</button><ul id="list"><li>trace source</li><li>pack symbols</li></ul><output id="spark">todo ready</output></section>`, "todo.css": `.todo{padding:24px;background:#071923;color:#eef}.todo input,.todo button{padding:10px;border-radius:12px}.todo li{margin:8px 0;padding:10px;background:#123;border-radius:12px}`, "todo.js": `document.getElementById("ignite").onclick=()=>{const li=document.createElement("li");li.textContent=document.getElementById("newItem").value;document.getElementById("list").appendChild(li);};` }; }

  function navFiles() { const items = ["root", "sefiros", "merkava", "parser", "runtime", "ram"].map(x => `<li><a href="#${x}">${x}</a></li>`).join(""); return { "nav.html": `<nav class="tree"><h2>Nested Navigation</h2><ul>${items}</ul><output id="spark">nav ready</output></nav>`, "nav.css": `.tree{padding:24px;background:#06141f;color:#eef}.tree ul{display:flex;flex-wrap:wrap;gap:10px}.tree li{list-style:none}.tree a{display:block;padding:10px 14px;border-radius:999px;background:#123b48;color:#73fff2}`, "nav.js": `document.getElementById("spark").textContent="navigation indexed";` }; }

  function formFiles() { return { "form.html": `<form class="wizard"><h2>Form Wizard</h2><label>Name<input value="Awtsmoos"></label><label>Mode<select><option>semantic</option><option>literal</option></select></label><button id="ignite" type="button">Save</button><output id="spark">form waiting</output></form>`, "form.css": `.wizard{padding:24px;background:#071923;color:#eef}.wizard label{display:block;margin:12px 0}.wizard input,.wizard select,.wizard button{padding:10px;border-radius:12px;width:100%}`, "form.js": `document.getElementById("ignite").onclick=()=>document.getElementById("spark").textContent="form saved";` }; }

  function animationFiles() { return { "anim.html": `<section class="anim"><h2>CSS Animation Lab</h2><div class="orb"></div><output id="spark">animation ready</output></section>`, "anim.css": `.anim{padding:24px;background:#050b16;color:white}.orb{width:90px;height:90px;border-radius:50%;background:#73fff2;animation:pulse 1.4s infinite alternate}@keyframes pulse{from{transform:scale(.8);opacity:.5}to{transform:scale(1.2);opacity:1}}`, "anim.js": `document.getElementById("spark").textContent="animation compiled";` }; }

  function svgFiles() { const icons = Array.from({ length: 12 }, (_, i) => `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="${6 + i % 6}"></circle></svg>`).join(""); return { "icons.html": `<section class="icons"><h2>SVG Icon Wall</h2>${icons}<output id="spark">icons ready</output></section>`, "icons.css": `.icons{padding:24px;background:#071923;color:white}.icons svg{width:54px;height:54px;margin:6px;fill:#73fff2;background:#102c38;border-radius:14px}`, "icons.js": `document.getElementById("spark").textContent="icons packed";` }; }

  function particlesFiles() { return { "particles.html": `<section class="stage"><h2>Canvas Particles</h2><canvas id="stage" width="560" height="320"></canvas><output id="spark">particles ready</output></section>`, "particles.css": `.stage{padding:24px;background:#06141f;color:#eaffff}.stage canvas{width:100%;border-radius:18px;background:#02050a;touch-action:none}`, "particles.js": `/* lowered to RAM canvas */` }; }
})(window);
