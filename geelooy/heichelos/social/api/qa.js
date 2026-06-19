// B"H
/**
 * @module QaApi
 * @description
 * Chapter 107: A question is a post, an answer is a post, and comments remain
 * discussion. Answers can be accepted, threaded, cited, and shown as their own
 * kind of revealed vessel.
 */
export function createQaApi(client) {
    const question = id => '/questions/' + encodeURIComponent(id);
    return {
        ask: body => client.post('/questions', body),
        get: id => client.get(question(id)),
        answer: (id, body) => client.post(question(id) + '/answers', body),
        answersForQuestion: id => client.get(question(id) + '/answers'),
        acceptedAnswer: (id, body) => client.post(question(id) + '/accepted-answer', body),
        answerComments: answerId => client.get('/answers/' + encodeURIComponent(answerId) + '/comments')
    };
}
