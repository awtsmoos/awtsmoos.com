
// B"H

const $ = id => document.getElementById(id);

async function getJson(url) {
  const r = await fetch(url, { credentials: "include" });
  const t = await r.text();

  try {
    return JSON.parse(t);
  } catch (e) {
    return { ok: false, error: t };
  }
}

function coinCard(c) {
  return [
    '<div class="coin-card">',
    '<div class="coin">✦</div>',
    '<strong>' + c.count + ' × ' + c.name + '</strong>',
    '<span>' + c.perutahs + ' perutahs each</span>',
    '</div>'
  ].join("");
}

function ratioCard(c) {
  return [
    '<div class="ratio-card">',
    '<strong>' + c.name + '</strong>',
    '<span>' + c.perutahs + ' Perutahs</span>',
    '<em>' + c.note + '</em>',
    '</div>'
  ].join("");
}

function txRow(t) {
  const sign = t.amount >= 0 ? "+" : "";
  return [
    '<div class="tx-row">',
    '<strong>' + t.type + '</strong>',
    '<span>' + sign + t.amount + ' perutahs</span>',
    '<em>' + new Date(t.at).toLocaleString() + '</em>',
    '</div>'
  ].join("");
}

function render(got) {
  if (!got.ok) {
    $("balance").textContent = "Login needed";
    $("usdValue").textContent = got.error || "not logged in";
    return;
  }

  const w = got.wallet;

  $("balance").textContent = w.balance + " Perutahs";
  $("usdValue").textContent = "≈ $" + w.usdValue.toFixed(2);
  $("coinGrid").innerHTML = w.coins.map(coinCard).join("");
  $("coinSystem").innerHTML = got.coinSystem.map(ratioCard).join("");
  $("ledger").innerHTML = (w.recent || []).map(txRow).join("") || "<p>No transactions yet.</p>";

  const pct = Math.round((w.balance / w.cap) * 100);

  $("refillBox").innerHTML = [
    '<div class="meter-line"><span>Balance cap</span><strong>' + w.balance + ' / ' + w.cap + '</strong></div>',
    '<div class="meter"><div style="width:' + Math.min(100, pct) + '%"></div></div>',
    '<p>Daily refill: +' + w.dailyRefill + ' perutahs. It refills once per day without overflowing the cap.</p>'
  ].join("");
}

async function refresh() {
  const got = await getJson("/api/wallet/balance");
  render(got);
}

$("refreshBtn").onclick = refresh;

$("mockBuyBtn").onclick = async () => {
  const got = await getJson("/api/wallet/buy/mock?dollars=" + encodeURIComponent($("dollars").value));
  $("buyOut").textContent = JSON.stringify(got, null, 2);
  await refresh();
};

$("paypalBtn").onclick = async () => {
  const got = await getJson("/api/wallet/paypal/create?dollars=" + encodeURIComponent($("dollars").value));
  $("buyOut").textContent = JSON.stringify(got, null, 2);

  const approve = got.order?.links?.find(x => x.rel === "approve")?.href;
  if (approve) location.href = approve;
};

refresh();
