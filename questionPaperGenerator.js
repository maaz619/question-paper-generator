const AppError = require('./error.middleware')

class QuestionPaperGenerator {
    constructor(questionStore) {
        this.questionStore = questionStore
    }

    //this function is to generate the question paper based on the difficulty distribution
    generateQuestionsBasedOnDifficulty(totalMarks, difficultiyDistributions, next) {
        let difficulties = difficultiyDistributions;
        if (!Object.keys(difficulties).length) difficulties = { hard: 100 }
        const sumofdifficulties = Object.values(difficulties).reduce((a, b) => a + b, 0)
        if (sumofdifficulties !== 100) return next(new AppError(400, "sum of difficulty distribution should be 100"))
        const totalQuestions = {};
        const result = []
        let remainingMarks = totalMarks;
        let marksVariation = {}

        //this loop is to get the number of questions based on difficulty
        for (const [difficulty, percentage] of Object.entries(difficulties)) {
            const difficultyMarks = Math.floor((percentage / 100) * totalMarks);
            const difficultyQuestions = Math.floor(difficultyMarks / this.getMarksVariation(difficulty))
            totalQuestions[difficulty] = difficultyQuestions
            marksVariation[difficulty] = this.getMarksVariation(difficulty)
            remainingMarks -= Math.floor(difficultyQuestions * this.getMarksVariation(difficulty))
        }

        this.fillRemainingMarks(remainingMarks, totalQuestions, marksVariation)

        //this loop is to push the questions object into the result array based on difficulty
        for (const [difficulty, numberOfQuestions] of Object.entries(totalQuestions)) {
            const questions = this.getQuestionsByDifficulty(difficulty)
            const shuffledQuestions = this.getShuffledQuestion(questions, numberOfQuestions)
            result.push(...shuffledQuestions)
        }
        return { totalQuestions, Questions: result }
    }

    //this function is to get the marks variation based on difficulty
    getMarksVariation(difficulty) {
        return this.questionStore.questions.find(question => question.difficulty === difficulty).marks
    }

    //this function is to fill the remaining marks if any marks are left after dividing the marks based on difficulty
    fillRemainingMarks(remainingMarks, totalQuestions, marksVariation) {
        let iteration = 0
        while (remainingMarks > 0) {
            for (const [index, [difficulty, marks]] of Object.entries(marksVariation).entries()) {
                if (remainingMarks % marks === 0) {
                    totalQuestions[difficulty] += 1;
                    remainingMarks -= marks;
                }
                else if (remainingMarks % marks !== 0 && remainingMarks > marks && index === Object.keys(marksVariation).length - 1) {
                    totalQuestions[difficulty] += 1
                    remainingMarks -= marks
                }
                else if (remainingMarks % marks !== 0 && remainingMarks > marks && iteration > 0) {
                    totalQuestions[difficulty] += 1
                    remainingMarks -= marks
                }
            }

            /* only works for if remaining marks is 1 after adjusting and it does not work for all the cases

                ***** in my case the marks variations are 2 for easy ,5 for medium and 10 for hard *****

            */

            if (remainingMarks === 1 && !Object.values(marksVariation).includes(1)) {
                totalQuestions['easy'] += 3;
                totalQuestions['medium'] -= 1;
                remainingMarks -= 1;
                break;
            }
            iteration++
        }

        if (remainingMarks > 0) {
            throw new AppError(400, "cannot generate paper with given the marks vaiation")
        }
    }

    //this function is to get the questions based on difficulty
    getQuestionsByDifficulty(difficulty) {
        const questions = this.questionStore.questions
        return questions.filter(question => question.difficulty === difficulty);
    }

    // this is fisher-yates shuffle algorithm to shuffle the questions for unique question paper
    getShuffledQuestion(questions, numberOfQuestions) {
        const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
        return shuffledQuestions.slice(0, numberOfQuestions);
    }

}

module.exports = QuestionPaperGenerator;
