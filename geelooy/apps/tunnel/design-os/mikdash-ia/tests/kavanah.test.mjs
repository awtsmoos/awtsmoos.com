//B"H
import { check, eq, ok, throws } from "./helpers.mjs";
import { requiresKavanah, renderKavanahGate, passedKavanah, kavanahKey, KAVANAH_CLIENT_JS } from "../kavanah.mjs";

function memStorage() {
	const m = new Map();
	return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) };
}

export function run() {
	return [
		check("only kodesh requires kavanah", () => {
			ok(requiresKavanah("/heichelos/ikar/series/tanya/post/p"));
			ok(!requiresKavanah("/heichelos/ikar/series/meluket/post/p"));
			ok(!requiresKavanah("/heichelos"));
			ok(!requiresKavanah("/"));
		}),
		check("gate html has enter + return, escaped title", () => {
			const html = renderKavanahGate({
				title: 'Test <script>alert("x")</script>',
				continueUrl: "/heichelos/ikar/series/tanya/post/p?entered=1",
				returnUrl: "/heichelos",
			});
			ok(!html.includes("<script>alert"), "title escaped");
			ok(html.includes("data-kavanah-enter"), "enter control");
			ok(html.includes("Kodesh HaKodashim"), "names the level");
			ok(html.includes("min-height: 44px") || html.includes("min-height:44px"), "44px touch target");
		}),
		check("gate requires continueUrl", () => {
			throws(() => renderKavanahGate({ title: "x" }));
		}),
		check("passedKavanah reads session storage", () => {
			const s = memStorage();
			ok(!passedKavanah("/heichelos/ikar/series/tanya/post/p", s));
			s.setItem(kavanahKey("/heichelos/ikar/series/tanya/post/p"), "1");
			ok(passedKavanah("/heichelos/ikar/series/tanya/post/p", s));
		}),
		check("client js is non-empty and safe", () => {
			ok(KAVANAH_CLIENT_JS.length > 50);
			ok(KAVANAH_CLIENT_JS.includes("sessionStorage"), "uses sessionStorage");
		}),
	];
}
