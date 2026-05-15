
// B"H
function handleAliasLogin(ctx, client, aliasId) {
  if (client.aliasId) {
    const oldSet = ctx.aliasMap.get(client.aliasId);
    if (oldSet) oldSet.delete(client);
  }

  client.aliasId = aliasId;

  if (!ctx.aliasMap.has(aliasId)) {
    ctx.aliasMap.set(aliasId, new Set());
  }

  ctx.aliasMap.get(aliasId).add(client);
  client.send({ type: "ACK", message: `Logged in as ${aliasId}` });
}

function sendToAlias(ctx, targetAlias, data) {
  if (!targetAlias) return false;
  if (trySend(ctx, targetAlias, data)) return true;

  const shortName = targetAlias.split(/[@_]/)[0];
  if (shortName && shortName !== targetAlias && trySend(ctx, shortName, data)) return true;

  if (!targetAlias.includes("_") && !targetAlias.includes("@")) {
    const longName = `${targetAlias}_at_awtsmoos.com`;
    if (trySend(ctx, longName, data)) return true;
  }

  const swapped = targetAlias.includes("_at_")
    ? targetAlias.replace("_at_", "@")
    : targetAlias.replace("@", "_at_");

  if (swapped !== targetAlias && trySend(ctx, swapped, data)) return true;

  return false;
}

function trySend(ctx, key, data) {
  if (!ctx.aliasMap.has(key)) return false;

  for (const client of ctx.aliasMap.get(key)) {
    client.send(data);
  }

  return true;
}

module.exports = { handleAliasLogin, sendToAlias, trySend };
