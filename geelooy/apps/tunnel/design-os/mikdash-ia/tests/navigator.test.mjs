//B"H
import { check, eq, ok } from "./helpers.mjs";
import { ascentPath, levelHomeUrl, renderBreadcrumbs, kodeshReturnPath } from "../navigator.mjs";

export function run() {
	return [
		check("ascentPath for kodesh has 4 crumbs", () => {
			const trail = ascentPath("/heichelos/ikar/series/tanya/post/p1");
			eq(trail.length, 4);
			eq(trail[0].id, "shaar");
			eq(trail[3].id, "kodesh");
			ok(trail[3].current);
			ok(!trail[0].current);
		}),
		check("ascentPath for gateway has 1 crumb", () => {
			const trail = ascentPath("/");
			eq(trail.length, 1);
			ok(trail[0].current);
		}),
		check("crumbs carry Hebrew names", () => {
			const trail = ascentPath("/heichelos");
			ok(trail.every((c) => c.nameHe && c.english));
		}),
		check("levelHomeUrl shaar is /", () => {
			eq(levelHomeUrl("shaar", "/heichelos/ikar/series/tanya/post/p"), "/");
		}),
		check("levelHomeUrl azarah prefers series index", () => {
			eq(levelHomeUrl("azarah", "/heichelos/ikar/series/tanya/post/p"), "/heichelos/ikar/series/tanya");
		}),
		check("renderBreadcrumbs marks current", () => {
			const html = renderBreadcrumbs("/heichelos/ikar/series/tanya/post/p");
			ok(html.includes('aria-current="page"'), "current page marked");
			ok(html.includes("Kodesh HaKodashim") || html.includes("קודש הקודשים"), "kodesh named");
			ok(html.includes("<nav"), "nav landmark");
		}),
		check("kodeshReturnPath prefers cameFrom", () => {
			eq(kodeshReturnPath("/heichelos/ikar/series/tanya/post/p", "/heichelos"), "/heichelos");
		}),
		check("kodeshReturnPath falls back to azarah", () => {
			const r = kodeshReturnPath("/heichelos/ikar/series/tanya/post/p");
			eq(r, "/heichelos/ikar/series/tanya");
		}),
	];
}
