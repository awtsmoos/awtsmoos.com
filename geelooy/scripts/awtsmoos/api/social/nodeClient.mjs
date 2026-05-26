//B"H
/**
 * @module AwtsmoosSocialNodeClient
 * @description
 * A tiny Node-friendly client for scripts that use Awtsmoos Social API keys.
 * It intentionally stays dependency-free and only adds the Bearer key header.
 */

export class AwtsmoosSocialNodeClient {
    constructor({ baseUrl = 'http://127.0.0.1:8080/api/social', apiKey } = {}) {
        if (!apiKey) throw new Error('B"H: apiKey is required');
        this.baseUrl = baseUrl.replace(/\/$/, '');
        this.apiKey = apiKey;
    }

    async request(path, { method = 'GET', body } = {}) {
        const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
        const response = await fetch(url, {
            method,
            headers: {
                authorization: `Bearer ${this.apiKey}`,
                ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {})
            },
            body: body ? new URLSearchParams(body).toString() : undefined
        });
        const text = await response.text();
        let json = null;
        if (text) {
            try {
                json = JSON.parse(text);
            } catch (error) {
                return { error: { code: 'INVALID_JSON', message: error.message, raw: text } };
            }
        }
        if (!response.ok) {
            return { error: { code: response.status, message: response.statusText, details: json } };
        }
        return json;
    }

    async verifyKey() {
        return await this.request('/keys/verify');
    }

    async resolveEntity(entity) {
        return await this.request(`/graph/entity/resolve?${new URLSearchParams(entity).toString()}`);
    }

    async listReferences(entity, { direction = 'outbound', kind = 'references' } = {}) {
        return await this.request(`/graph/references?${new URLSearchParams({ ...entity, direction, kind }).toString()}`);
    }

    async createQuestion({ heichelId, aliasId, postId, title, content, seriesId = 'root', sections = [] }) {
        return await this.request(`/content/heichelos/${encodeURIComponent(heichelId)}/questions`, {
            method: 'POST',
            body: { aliasId, postId, title, content, seriesId, sections: JSON.stringify(sections) }
        });
    }

    async createAnswer({ heichelId, questionId, aliasId, answerId, title, content, seriesId = 'root' }) {
        return await this.request(`/content/heichelos/${encodeURIComponent(heichelId)}/questions/${encodeURIComponent(questionId)}/answers`, {
            method: 'POST',
            body: { aliasId, answerId, title, content, seriesId }
        });
    }

    async listAnswers({ heichelId, questionId }) {
        return await this.request(`/content/heichelos/${encodeURIComponent(heichelId)}/questions/${encodeURIComponent(questionId)}/answers`);
    }

    async createSection({ heichelId, postId, aliasId, sectionId, title, content }) {
        return await this.request(`/content/heichelos/${encodeURIComponent(heichelId)}/posts/${encodeURIComponent(postId)}/sections`, {
            method: 'POST',
            body: { aliasId, sectionId, title, content }
        });
    }

    async listSections({ heichelId, postId }) {
        return await this.request(`/content/heichelos/${encodeURIComponent(heichelId)}/posts/${encodeURIComponent(postId)}/sections`);
    }

    async repostEntity({ from, to, aliasId, excerpt = '', note = '' }) {
        return await this.graphContentLink('/content/repost', { from, to, aliasId, excerpt, note, kind: 'reposts' });
    }

    async shareEntity({ from, to, aliasId, excerpt = '', note = '' }) {
        return await this.graphContentLink('/content/share', { from, to, aliasId, excerpt, note, kind: 'crossLinks' });
    }

    async graphContentLink(path, { from, to, aliasId, excerpt = '', note = '', kind }) {
        const body = { aliasId, excerpt, note, kind };
        for (const [prefix, entity] of [['from', from], ['to', to]]) {
            body[`${prefix}Type`] = entity.type;
            body[`${prefix}Id`] = entity.id;
            if (entity.heichelId) body[`${prefix}HeichelId`] = entity.heichelId;
            if (entity.seriesId) body[`${prefix}SeriesId`] = entity.seriesId;
            if (entity.parentId) body[`${prefix}ParentId`] = entity.parentId;
            if (entity.sectionId) body[`${prefix}SectionId`] = entity.sectionId;
            if (entity.aliasId) body[`${prefix}AliasId`] = entity.aliasId;
        }
        return await this.request(path, { method: 'POST', body });
    }

    async addReference({ from, to, kind = 'references', aliasId, excerpt = '', note = '' }) {
        const body = { kind, aliasId, excerpt, note };
        for (const [prefix, entity] of [['from', from], ['to', to]]) {
            body[`${prefix}Type`] = entity.type;
            body[`${prefix}Id`] = entity.id;
            if (entity.heichelId) body[`${prefix}HeichelId`] = entity.heichelId;
            if (entity.seriesId) body[`${prefix}SeriesId`] = entity.seriesId;
            if (entity.parentId) body[`${prefix}ParentId`] = entity.parentId;
            if (entity.sectionId) body[`${prefix}SectionId`] = entity.sectionId;
            if (entity.aliasId) body[`${prefix}AliasId`] = entity.aliasId;
        }
        return await this.request('/graph/references', { method: 'POST', body });
    }
}

export default AwtsmoosSocialNodeClient;
