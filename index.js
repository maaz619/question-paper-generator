const http = require("node:http")
const express = require('express')
const { QuestionStore } = require('./assets/questions');
const QuestionPaperGenerator = require('./questionPaperGenerator');
const AppError = require("./error.middleware");

const app = express()
const server = http.createServer(app)
app.use(express.json());

//error handler for development on;ly
const errorHandler = (err, req, res, next) => {
    res.status(err.statusCode).json({
        error: {
            status: err.statusCode,
            message: err.message,
        },
        stack: err.stack,
    });
}

const questionStore = new QuestionStore();

const questionPaperGenerator = new QuestionPaperGenerator(questionStore);

app.get('/', (req, res) => {
    res.status(200).end(`welcome to ${req.headers.host}`)
})

app.post('/question-paper', (req, res, next) => {
    const { totalMarks, difficultyDistribution } = req.body;
    let difficulties = difficultyDistribution;
    if (!totalMarks) return next(new AppError(500, "marks is either not defined or total marks is 0"))
    if (!difficultyDistribution) difficulties = {}
    try {
        const generatedPaper = questionPaperGenerator.generateQuestionsBasedOnDifficulty(totalMarks, difficulties, next);
        res.json(generatedPaper);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.use(errorHandler)

server.listen(3000, () => {
    console.log("server at 3000")
})


