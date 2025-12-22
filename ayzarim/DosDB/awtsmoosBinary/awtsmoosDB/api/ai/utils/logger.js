
// B"H
const log = (msg) => {
    const time = new Date().toISOString();
    console.log(`B"H [${time}] ${msg}`);
};

const error = (msg) => {
    const time = new Date().toISOString();
    console.error(`B"H [${time}] [ERROR] ${msg}`);
};

module.exports = { log, error };
