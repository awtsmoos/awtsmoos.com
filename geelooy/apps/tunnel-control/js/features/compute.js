// B"H
import { h, out, $ } from "../ui/dom.js";
import { apiGet } from "../ui/api.js";

/**
 * B"H
 * Chapter: The Compute Chamber became a playful Beis Midrash of coins.
 */
export function compute() {
  return h("section", { className: "pane awt-compute-pane", data: { pane: "compute" } }, [
    h("div", { className: "page-head awt-compute-head" }, [
      h("p", { className: "eyebrow", text: "Awtsmoos Compute" }),
      h("h2", { text: "Perutas, sandbox buys, and ancient coin math" }),
      h("p", { text: "Buy compute in modern dollars, view it as perutas, then learn the playful coin ladder: isar, pundyon, me'ah, dinar, sela, darkon." })
    ]),
    h("article", { className: "panel awt-compute-hero" }, [
      h("div", {}, [h("span", { className: "awt-coin-orbit", text: "פּ" }), h("strong", { id: "computeBalance", text: "Loading balance..." }), h("small", { text: "Free users receive 5,000 perutas/day, max free balance 15,000." })]),
      h("button", { id: "refreshComputeBtn", className: "primary", text: "Refresh compute" })
    ]),
    h("div", { className: "awt-compute-grid" }, [
      h("article", { className: "panel stack" }, [h("h3", { text: "Sandbox PayPal packs" }), h("p", { text: "Base price: $1 = 100,000 perutas. Bigger packs add bonus perutas. Sandbox buttons only prepare test payloads for now." }), h("div", { id: "computePacks", className: "awt-pack-grid" })]),
      h("article", { className: "panel stack" }, [h("h3", { text: "Coin converter" }), converterControls(), h("div", { id: "coinResults", className: "awt-coin-results" })])
    ]),
    h("article", { className: "panel stack awt-coin-learning" }, [h("h3", { text: "Talmudic ladder" }), h("p", { text: "Educational visualization based on the requested Rambam-style coin relationships. Barley weights are learning markers; billing remains exact peruta accounting." }), h("div", { id: "coinLadder", className: "awt-coin-ladder" })]),
    h("article", { className: "panel stack" }, [h("h3", { text: "Raw compute response" }), out("computeOut", "No compute response yet.")])
  ]);
}

function converterControls() {
  return h("div", { className: "form-grid" }, [
    h("label", {}, ["Amount", h("input", { id: "coinAmount", type: "number", min: "0", value: "100000" })]),
    h("label", {}, ["Coin", h("select", { id: "coinType" }, [h("option", { value: "peruta", text: "Perutah" })])]),
    h("button", { id: "convertCoinsBtn", className: "primary", text: "Convert" })
  ]);
}

export function mountCompute() {
  if (!$("refreshComputeBtn")) return;
  $("refreshComputeBtn").onclick = loadCompute;
  $("convertCoinsBtn").onclick = loadCompute;
  loadCompute().catch(error => showRaw({ ok: false, error: String(error) }));
}

async function loadCompute() {
  const amount = $("coinAmount")?.value || "100000";
  const coin = $("coinType")?.value || "peruta";
  const got = await apiGet(`/api/tunnel/control/compute?amount=${encodeURIComponent(amount)}&coin=${encodeURIComponent(coin)}`);
  showRaw(got);
  renderBalance(got);
  renderCoinOptions(got.coins || [], coin);
  renderPacks(got.packs || []);
  renderCoins(got.selected?.conversion || got.selected, got.coins || []);
  renderLadder(got.coins || []);
}

function renderBalance(got) {
  const usage = got.current;
  const balance = usage ? Number(usage.perutaBalance || 0).toLocaleString() : "Log in to see balance";
  if ($("computeBalance")) $("computeBalance").textContent = `${balance} perutas`;
}

function renderCoinOptions(coins, selected) {
  const select = $("coinType");
  if (!select || !coins.length) return;
  select.replaceChildren(...coins.map(coin => h("option", { value: coin.key, text: coin.label })));
  select.value = selected;
}

function renderPacks(packs) {
  const box = $("computePacks");
  if (!box) return;
  box.replaceChildren(...packs.map(pack => h("article", { className: "awt-pack-card" }, [
    h("span", { text: pack.key }),
    h("strong", { text: `$${pack.dollars}` }),
    h("b", { text: `${Number(pack.perutas).toLocaleString()} perutas` }),
    h("small", { text: pack.bonus ? `Bonus: ${Number(pack.bonus).toLocaleString()} over base` : "Base pack" }),
    h("a", { attrs: { href: `/api/tunnel/control/compute?pack=${encodeURIComponent(pack.key)}`, target: "_blank", rel: "noopener" }, text: "Inspect sandbox order" })
  ])));
}

function renderCoins(conversion) {
  const box = $("coinResults");
  if (!box || !conversion) return;
  const rows = conversion.conversions || conversion.perutaConversions || [];
  box.replaceChildren(...rows.map(row => h("article", { className: "awt-coin-card" }, [h("strong", { text: row.display }), h("small", { text: `${row.perutas.toLocaleString()} perutas each · ${row.barleyKernels} barley kernels` })])));
}

function renderLadder(coins) {
  const box = $("coinLadder");
  if (!box) return;
  box.replaceChildren(...coins.map(coin => h("article", { className: "awt-ladder-coin" }, [
    h("b", { text: coin.label }),
    h("strong", { text: `${coin.perutas.toLocaleString()} פּ` }),
    h("span", { text: `${coin.barleyKernels} barley kernels` }),
    h("small", { text: coin.note })
  ])));
}

function showRaw(got) {
  if ($("computeOut")) $("computeOut").textContent = JSON.stringify(got, null, 2);
}
