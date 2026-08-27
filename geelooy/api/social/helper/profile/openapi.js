// B"H
/**
 * @module SocialOpenApiUnified
 * @description Chapter 432: One OpenAPI document for one canonical social API.
 */
function openApiDoc() {
    const routeList = [
        "/meta", "/openapi.json", "/profiles/batch", "/profiles/{alias}",
        "/profiles/{alias}/activity", "/profiles/{alias}/analytics",
        "/profiles/{alias}/graph", "/profiles/{alias}/history", "/search",
        "/feed", "/trending", "/recommendations/{alias}", "/follows/{alias}",
        "/followers/{type}/{id}", "/bulk", "/events", "/heichelos/discover"
    ];
    const paths = {};
    for (const path of routeList) {
        paths[path] = { get: { summary: `B\"H ${path}`, responses: { 200: { description: "Structured Awtsmoos social response" } } } };
    }
    paths["/bulk"] = { post: { summary: "Bulk social writes", responses: { 200: { description: "Bulk operation results" } } } };
    paths["/follows/{alias}"] = {
        get: paths["/follows/{alias}"].get,
        post: { summary: "Follow an entity", responses: { 200: { description: "Follow stored" } } },
        delete: { summary: "Unfollow an entity", responses: { 200: { description: "Follow removed" } } }
    };
    paths["/profiles/{alias}/history"] = {
        get: paths["/profiles/{alias}/history"].get,
        post: { summary: "Record view history", responses: { 200: { description: "History recorded" } } },
        delete: { summary: "Clear view history", responses: { 200: { description: "History cleared" } } }
    };
    return { openapi: "3.1.0", info: { title: "Awtsmoos Unified Social API", version: "unified-1.0.0" }, servers: [{ url: "/api/social" }], paths };
}
module.exports = { openApiDoc };
