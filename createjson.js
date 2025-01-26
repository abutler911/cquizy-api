const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const questions = [];

const askQuestion = () => {
  rl.question(
    "Enter the question (or type 'exit' to finish): ",
    (questionText) => {
      if (questionText.toLowerCase() === "exit") {
        // Write to JSON and exit
        fs.writeFile(
          "questions.json",
          JSON.stringify(questions, null, 2),
          (err) => {
            if (err) {
              console.error("Error writing file:", err);
            } else {
              console.log("Questions saved to questions.json");
            }
            rl.close();
          }
        );
      } else {
        rl.question("Enter the answer: ", (answer) => {
          rl.question("Enter the category: ", (category) => {
            rl.question("Enter the context: ", (context) => {
              const questionNumber = questions.length + 1;
              questions.push({
                question: questionText,
                answer,
                category,
                context,
                questionNumber,
              });
              console.log("Question added!");
              askQuestion();
            });
          });
        });
      }
    }
  );
};

// Start the prompt
askQuestion();
