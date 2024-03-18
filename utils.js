let { writeFileSync, readFileSync } = require('fs');

function read_json(file) {
    return JSON.parse(readFileSync(`${file}.json`).toString());
}

function write_json(file, data) {
    let s = '';
    let p = 0;
    let j = undefined;

    for (i of JSON.stringify(data)) {
        if (i == '}') {
            s += '\n';
            p -= 1;
            s += ' '.repeat(p * 4)
        }

        if (j == ',' || j == '{') {
            s += ' '.repeat(p * 4)
        }

        s += i;

        if (i == ':') {
            s += ' ';
        }

        if (i == ',') {
            s += '\n';
        }

        if (i == '{') {
            s += '\n';
            p += 1;
        }

        j = i;
    }

    return writeFileSync(`${file}.json`, s);
}

module.exports = { read_json, write_json }