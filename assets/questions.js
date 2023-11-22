const fs = require('node:fs');

const questions = JSON.parse(fs.readFileSync(`${__dirname}/questions.json`));

class QuestionStore {
    constructor() {
        this.questions = questions;
    }
}

module.exports = {
    QuestionStore
}