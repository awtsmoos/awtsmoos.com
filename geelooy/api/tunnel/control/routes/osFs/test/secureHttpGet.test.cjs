// B"H
const assert = require("node:assert/strict");
const test = require("node:test");
const { isPublicAddress, parsePublicUrl, secureHttpGet } = require("../secureHttpGet.js");

const publicDns = async () => [{ address: "93.184.215.14", family: 4 }];

test("HTTP GET blocks private, metadata, loopback, IPv6 translation, and invalid schemes", () => {
  for (const ip of ["127.0.0.1", "10.0.0.1", "172.31.1.2", "169.254.169.254", "192.168.1.1", "::1", "fc00::1", "2002:c0a8:0101::", "::ffff:127.0.0.1"]) {
    assert.equal(isPublicAddress(ip), false, ip);
  }
  for (const ip of ["1.1.1.1", "93.184.215.14", "2606:4700:4700::1111"]) {
    assert.equal(isPublicAddress(ip), true, ip);
  }
  for (const url of ["http://127.0.0.1/", "http://169.254.169.254/latest/", "http://localhost/", "http://host.internal/", "https://example.com:444/", "file:///etc/passwd", "http://user:pass@example.com/"]) {
    assert.throws(() => parsePublicUrl(url), /HTTP_GET_/, url);
  }
});

test("HTTP GET returns a real response contract from a DNS-pinned transport", async () => {
  let visited;
  const result = await secureHttpGet({ url: "https://example.com/data?privateQuery=1", maxBytes: 64 }, {
    lookup: publicDns,
    request: async (url, address, headers, timeout, maxBytes) => {
      visited = { host: url.hostname, address, timeout, maxBytes, headers };
      return { status: 202, headers: { "content-type": "application/json" }, body: '{"ok":true}', bytes: 11, truncated: false };
    }
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, 202);
  assert.equal(result.body, '{"ok":true}');
  assert.equal(result.url, "https://example.com/data"); // query stripped from the receipt
  assert.equal(visited.address.address, "93.184.215.14");
  assert.equal(visited.maxBytes, 64);
});

test("HTTP GET rejects all DNS answers when any is private", async () => {
  const response = await secureHttpGet({ url: "https://example.com" }, {
    lookup: async () => [{ address: "93.184.215.14", family: 4 }, { address: "127.0.0.1", family: 4 }],
    request: () => { throw Error("should_not_execute"); }
  });
  assert.equal(response.ok, false);
  assert.equal(response.error, "HTTP_GET_ADDRESS_DENIED");
});

test("HTTP GET validates every redirect and does not allow an internal redirection", async () => {
  const response = await secureHttpGet({ url: "https://example.com/start" }, {
    lookup: publicDns,
    request: async () => ({ redirect: "http://127.0.0.1/admin" })
  });
  assert.equal(response.ok, false);
  assert.equal(response.error, "HTTP_GET_ADDRESS_DENIED");
});

test("HTTP GET caps byte limits and timeouts; strips sensitive forwarded headers", async () => {
  const response = await secureHttpGet({ url: "https://example.com", maxBytes: 99999999, timeoutMs: 9999999,
    headers: { Authorization: "Bearer secret", Cookie: "session", Accept: "text/plain" } }, {
    lookup: publicDns,
    request: async (url, address, headers, timeout, maxBytes) => {
      assert.equal(maxBytes, 2_000_000);
      assert.equal(timeout, 30_000);
      assert.equal(headers.Authorization, undefined);
      assert.equal(headers.Cookie, undefined);
      assert.equal(headers.Accept, "text/plain");
      return { status: 200, body: "bounded", bytes: 7, truncated: true, headers: {} };
    }
  });
  assert.equal(response.truncated, true);
});
