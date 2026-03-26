
// B"H
module.exports = {
    handle(state, tgt, prop) {
        state.writer.delete(prop);
        return true;
    }
};
