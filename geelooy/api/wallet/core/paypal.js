
// B"H
const { usdToPerutahs } = require("./currency.js");

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "ASXHjeHTYENDmHjUK8RYsYfBoJC-06Ba9SSqxo4lz6dXN48o-G7yoMni7Ha3rvHBltm6XMxvGEc9o5Lw";
const SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const BASE = process.env.PAYPAL_BASE || "https://api-m.sandbox.paypal.com";

async function paypalFetch(path, opts = {}) {
  if (!SECRET) {
    throw new Error("PAYPAL_CLIENT_SECRET missing on server.");
  }

  const token = Buffer.from(CLIENT_ID + ":" + SECRET).toString("base64");

  const authRes = await fetch(BASE + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const auth = await authRes.json();

  if (!auth.access_token) {
    throw new Error("PayPal auth failed: " + JSON.stringify(auth));
  }

  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      Authorization: "Bearer " + auth.access_token,
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });

  const txt = await res.text();
  let json;

  try {
    json = JSON.parse(txt);
  } catch (e) {
    json = { text: txt };
  }

  if (!res.ok) {
    throw new Error("PayPal API failed: " + JSON.stringify(json));
  }

  return json;
}

async function createOrder({ dollars, userId, returnUrl, cancelUrl }) {
  const amount = Math.max(1, Number(dollars || 1)).toFixed(2);
  const perutahs = usdToPerutahs(amount);

  return await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: userId + ":" + perutahs,
          description: "Awtsmoos Perutah Wallet Top-Up",
          amount: {
            currency_code: "USD",
            value: amount
          }
        }
      ],
      application_context: {
        brand_name: "Awtsmoos",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl
      }
    })
  });
}

async function captureOrder(orderId) {
  return await paypalFetch("/v2/checkout/orders/" + encodeURIComponent(orderId) + "/capture", {
    method: "POST",
    body: "{}"
  });
}

module.exports = {
  CLIENT_ID,
  BASE,
  createOrder,
  captureOrder
};
