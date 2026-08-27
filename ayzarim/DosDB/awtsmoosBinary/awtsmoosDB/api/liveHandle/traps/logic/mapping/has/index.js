
// B"H
class HasAction {
    static execute(state) {
        return (k) => !!state.nav.resolveKey(k);
    }
}
module.exports = HasAction;
