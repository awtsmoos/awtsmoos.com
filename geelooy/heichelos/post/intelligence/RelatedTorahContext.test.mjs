// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	boundedReadingText,
	commentRelatedContext,
	isSubstantialEnglish,
	postRelatedContext
} from "./RelatedTorahContext.js";

/**
 * @file Proves reading intelligence stays bounded and refuses short or mostly non-English comment retrieval.
 * @description The Awtsmoos knows every letter without a limit, while Awtsmoos.com carries only a small semantic vessel into Torah search light;
 * substantial English may ask privately after dwell, while short reactions and unrelated scripts remain quiet through the night.
 */

const english = "The purpose of learning Torah is not merely to collect information but to refine the person who learns it, connecting thought, action, responsibility, memory, community, and the search for truth in a way that can continue through ordinary life with humility and care.";
const hebrew = "שלום עולם תורה מצוה נשמה אור אמת חיים קדושה ברכה חסד גבורה תפארת מלכות ".repeat(10);

assert.equal(isSubstantialEnglish("Nice point!"), false);
assert.equal(isSubstantialEnglish(hebrew), false);
assert.equal(isSubstantialEnglish(english), true);
assert.equal(boundedReadingText("<b>Hello</b>   world"), "Hello world");

const comment = commentRelatedContext(
	{ id: "c1", content: english },
	english,
	{ id: "p1", title: "A meaningful post", heichel: { id: "h1" } }
);
assert.equal(comment.kind, "comment");
assert.equal(comment.postId, "p1");
assert.ok(comment.prompt.length <= 760);
assert.ok(comment.excerpt.length <= 520);

const post = postRelatedContext(
	{ id: "p2", title: "Post title", heichel: { id: "h2" } },
	english.repeat(4)
);
assert.equal(post.kind, "post");
assert.ok(post.prompt.length <= 760);
assert.ok(post.excerpt.length <= 520);

console.log("Related Torah bounded-context contract: PASS");
