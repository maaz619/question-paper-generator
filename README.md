# Question Paper Generator

This app generates question papers based on specified criteria.

## Installation

1. Clone the repository: `git clone https://github.com/maaz619/question-paper-generator.git`
2. Get into the directory

```bash
 cd question-paper-generator
```

3. Install the required dependencies: `npm install`

## Usage

1. Run the app: `npm start`
2. Access the app in your browser at `http://localhost:3000`
3. Specify the criteria for generating the question paper.
4. Generate the question paper.

# Request Body

To generate a question paper, you can send a POST request to the following endpoint:

- You can use tools like **Postman** or **Thunder-client**.
- **totalMarks** is mandatory to provide but not **difficultyDistribution**

```json

POST /question-paper

{
  "totalMarks": 100,
  "difficultyDistribution": {
    "easy":30,
    "medium":20,
    "hard":50
  }
}

If difficultyDistribution is not provided then default difficulty will be:

{
    "difficultyDistribution":{
        "hard":100
    }
}
```
