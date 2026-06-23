// B"H
// Canvas coins: hachlatas are drawn as falling sparks inside the vessel.
const colors = {
  Tzedakah: "#ffd56a", Torah: "#8ee7ff", Chesed: "#ff9bd2",
  Tefillah: "#d8b4ff", "Ahavas Yisroel": "#9cffb0", "Personal Growth": "#ffb36a"
};

export function createPushkuhCanvas(canvas) {
  const context = canvas.getContext("2d");
  const coins = [];
  let width = 1;
  let height = 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = canvas.width = Math.max(1, rect.width * devicePixelRatio);
    height = canvas.height = Math.max(1, rect.height * devicePixelRatio);
  }

  function seed(entries) {
    coins.length = 0;
    entries.slice(-90).forEach((entry, index) => coins.push(makeCoin(entry, index, true)));
  }

  function drop(entry) {
    coins.push(makeCoin(entry, coins.length, false));
  }

  function loop() {
    drawBackground(context, width, height);
    drawVessel(context, width, height);
    coins.forEach(moveCoin);
    coins.forEach(coin => drawCoin(context, coin));
    requestAnimationFrame(loop);
  }

  resize();
  addEventListener("resize", resize);
  loop();
  return { seed, drop };
}

function makeCoin(entry, index, settled) {
  const spread = 65 + (index % 18) * 34;
  return {
    x: spread + Math.random() * 80,
    y: settled ? 250 + Math.random() * 110 : -40,
    r: entry.profileVisible ? 14 : 10,
    vx: Math.random() * 1.4 - .7,
    vy: settled ? 0 : 2,
    color: colors[entry.type] || "#ffd56a",
    glow: entry.done ? 1 : .55,
    target: 295 + Math.random() * 76
  };
}

function moveCoin(coin) {
  if (coin.y < coin.target) {
    coin.vy += .16;
    coin.y += coin.vy;
    coin.x += coin.vx;
  } else {
    coin.y += Math.sin(Date.now() / 500 + coin.x) * .04;
  }
}

function drawBackground(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w * .5, h * .2, 20, w * .5, h * .45, w * .7);
  g.addColorStop(0, "rgba(255,245,190,.22)");
  g.addColorStop(1, "rgba(20,10,45,.05)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawVessel(ctx, w, h) {
  const x = w * .22, y = h * .22, bw = w * .56, bh = h * .62;
  ctx.lineWidth = 8 * devicePixelRatio;
  ctx.strokeStyle = "rgba(255,235,170,.72)";
  ctx.fillStyle = "rgba(255,255,255,.08)";
  roundRect(ctx, x, y, bw, bh, 42 * devicePixelRatio);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "rgba(255,213,106,.85)";
  ctx.fillRect(w * .42, y + 25 * devicePixelRatio, w * .16, 7 * devicePixelRatio);
}

function drawCoin(ctx, coin) {
  ctx.shadowBlur = 22 * coin.glow;
  ctx.shadowColor = coin.color;
  ctx.fillStyle = coin.color;
  ctx.beginPath();
  ctx.arc(coin.x * devicePixelRatio, coin.y * devicePixelRatio, coin.r * devicePixelRatio, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
