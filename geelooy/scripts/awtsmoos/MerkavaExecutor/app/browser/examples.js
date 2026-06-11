// B"H
(function browserExamples(root) {
  const ect = root.AwtsEctBrowser;

  /**
   * B"H. Example scrolls are not recipes for compression; they are honest
   * smoke vessels that let the user see Native DOM, Virtual DOM, and WebGL
   * without pretending every project is one glowing ball.
   */
  ect.examples = [
    project("DOM Button", "dom", {
      "index.html": '<article class="card"><h2>Awtsmoos Bit Garden</h2><button id="ignite">Ignite</button><output id="spark">waiting</output></article>',
      "style.css": '.card{padding:24px;border-radius:18px;background:#071923;color:#eaffff}button{padding:10px;border-radius:999px}',
      "app.js": 'const spark=document.getElementById("spark");const button=document.getElementById("ignite");let count=0;button.addEventListener("click",()=>{count+=1;spark.textContent="pulse "+count;});'
    }),
    project("Canvas Ball", "canvas", {
      "index.html": '<section class="stage"><canvas id="stage" width="560" height="320"></canvas><output id="spark">ready</output></section>',
      "style.css": '.stage{padding:24px;background:#06141f;color:#eaffff}canvas{width:100%;touch-action:none;background:#02050a}',
      "app.js": 'const canvas=document.getElementById("stage");const spark=document.getElementById("spark");const ctx=canvas.getContext("2d");const ball={x:90,y:80,vx:2.4,vy:1.6,radius:18};function frame(){ball.x+=ball.vx;ball.y+=ball.vy;ctx.fillStyle="#02050a";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.beginPath();ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2);ctx.fill();spark.textContent="ball";requestAnimationFrame(frame);}frame();'
    }),
    project("Fetch Chain", "dom", {
      "index.html": '<button id="go">Load</button><output id="out"></output>',
      "style.css": 'button{display:block;padding:12px}output{display:block}',
      "app.js": 'const go=document.getElementById("go");const out=document.getElementById("out");go.addEventListener("click",()=>{fetch("/api/data").then(r=>r.json()).then(data=>{out.textContent=JSON.stringify(data);});});'
    })
  ];

  /** @param {string} title @param {string} kind @param {Record<string,string>} files */
  function project(title, kind, files) { return { title, kind, files }; }
})(window);
