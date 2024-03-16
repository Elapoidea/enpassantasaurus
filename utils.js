let { writeFileSync, readFileSync } = require('fs');

function read_json(file) {
    return JSON.parse(readFileSync(`${file}.json`).toString());
}

function write_json(file, data) {
    return writeFileSync(`${file}.json`, JSON.stringify(data));
}

module.exports = { read_json, write_json }