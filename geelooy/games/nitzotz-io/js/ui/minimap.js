// B"H

/** Draw a tactical minimap: gold is food, red is danger, white is you. */
export function drawMap(canvas, world) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.clientWidth * 2;
  const height = canvas.height = canvas.clientHeight * 2;
  const scale = width / (world.level.bounds * 2);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#070417';
  ctx.fillRect(0, 0, width, height);
  drawObjects(ctx, width, height, scale, world);
  dot(ctx, width / 2 + world.player.x * scale, height / 2 + world.player.y * scale, 6, '#ffffff');
  drawFloaters(ctx, width, height, scale, world);
}

function drawObjects(ctx, width, height, scale, world) {
  for (const object of world.level.objects) {
    if (object.taken) continue;
    const edible = object.r < world.player.r * 1.2;
    const danger = object.r > world.player.r * 1.4;
    const color = edible ? '#ffdf6e' : danger ? '#ff5c5c' : '#6f84ff';
    dot(ctx, width / 2 + object.x * scale, height / 2 + object.y * scale, edible ? 3.2 : 1.8, color);
  }
}

function drawFloaters(ctx, width, height, scale, world) {
  ctx.font = '20px system-ui';
  for (const floater of world.floaters) {
    ctx.fillStyle = `rgba(255, 240, 140, ${floater.life})`;
    ctx.fillText(floater.text, width / 2 + floater.x * scale, height / 2 + floater.y * scale);
  }
}

function dot(ctx, x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}
