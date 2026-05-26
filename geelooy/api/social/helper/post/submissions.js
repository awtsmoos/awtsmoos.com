//B"H
/**
 * @module postSubmissions
 * @description
 * Pending post vessels for heichelim. Non-authority authors may offer a post;
 * editors/moderators can later approve or deny. The approved path delegates
 * back to the canonical series post writer so there is only one final shape.
 */

const { sp } = require("../_awtsmoos.constants.js");
const { er } = require("../general.js");
const { verifyHeichelAuthority } = require("../heichel.js");
const { getHeichelSubmissionSettings } = require("../heichelRoles.js");

function submittedPostBase({ heichelId }) {
    return `${sp}/heichelos/${heichelId}/posts/submitted`;
}

function submittedPostPath({ heichelId, postId }) {
    return `${submittedPostBase({ heichelId })}/all/${postId}`;
}

function submittedPostListPath({ heichelId, seriesId }) {
    return `${submittedPostBase({ heichelId })}/bySeries/${seriesId}`;
}

function postPayloadFromRequest({ $i, heichelId, seriesId }) {
    const body = $i.$_POST || {};
    return {
        id: body.postId || `BH_SUBMITTED_POST_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        heichelId,
        seriesId: seriesId || body.seriesId || "root",
        aliasId: body.aliasId,
        title: String(body.title || "").trim(),
        content: String(body.content || "").trim(),
        dayuh: body.dayuh,
        submittedAt: Date.now(),
        status: "submitted"
    };
}

async function shouldSubmitPostForApproval({ $i, heichelId, aliasId }) {
    const authority = await verifyHeichelAuthority({ $i, heichelId, aliasId });
    if (authority) return { shouldSubmit: false, authority: true };

    const settings = (await getHeichelSubmissionSettings({ $i, heichelId })).success || {};
    if (settings.allowPostSubmissions === false) {
        return {
            shouldSubmit: false,
            authority: false,
            error: er({
                message: "Post submissions are closed for this heichel.",
                code: "POST_SUBMISSIONS_CLOSED"
            })
        };
    }

    return { shouldSubmit: true, authority: false };
}

async function submitPostForApproval({ $i, heichelId, seriesId }) {
    const post = postPayloadFromRequest({ $i, heichelId, seriesId });
    if (!post.aliasId || !post.title) {
        return er({ code: "MISSING_PARAMS", details: "Requires aliasId and title" });
    }

    await $i.db.write(submittedPostPath({ heichelId, postId: post.id }), post);
    await $i.db.arrayAppend(submittedPostListPath({ heichelId, seriesId: post.seriesId }), {
        postId: post.id,
        aliasId: post.aliasId,
        title: post.title,
        submittedAt: post.submittedAt
    });

    return {
        success: {
            submitted: true,
            message: "Post submitted for approval.",
            postId: post.id,
            seriesId: post.seriesId
        }
    };
}

async function getSubmittedPosts({ $i, heichelId }) {
    const allPath = `${submittedPostBase({ heichelId })}/all`;
    const posts = await $i.db.get(allPath).catch(() => null);
    return {
        success: posts && typeof posts === "object" ? posts : {}
    };
}

async function approveSubmittedPost({ $i, heichelId, postId, approverAliasId, addPostToSeries }) {
    const authority = await verifyHeichelAuthority({ $i, heichelId, aliasId: approverAliasId });
    if (!authority) return er({ message: "No authority to approve posts.", code: "NO_AUTH" });

    const path = submittedPostPath({ heichelId, postId });
    const submitted = await $i.db.get(path).catch(() => null);
    if (!submitted) return er({ message: "Submitted post not found.", code: "NOT_FOUND", postId });

    const oldPost = $i.$_POST;
    $i.$_POST = {
        aliasId: submitted.aliasId,
        title: submitted.title,
        content: submitted.content,
        dayuh: submitted.dayuh,
        seriesId: submitted.seriesId,
        __approvedBy: approverAliasId
    };

    const result = await addPostToSeries({
        $i,
        heichelId,
        seriesId: submitted.seriesId,
        isApproval: true
    });
    $i.$_POST = oldPost;

    if (result?.success) {
        await $i.db.delete(path);
        return {
            success: {
                approved: postId,
                wrote: result.success
            }
        };
    }

    return result;
}

async function denySubmittedPost({ $i, heichelId, postId, approverAliasId }) {
    const authority = await verifyHeichelAuthority({ $i, heichelId, aliasId: approverAliasId });
    if (!authority) return er({ message: "No authority to deny posts.", code: "NO_AUTH" });

    const path = submittedPostPath({ heichelId, postId });
    const deleted = await $i.db.delete(path);
    return { success: { denied: postId, deleted } };
}

module.exports = {
    shouldSubmitPostForApproval,
    submitPostForApproval,
    getSubmittedPosts,
    approveSubmittedPost,
    denySubmittedPost
};
