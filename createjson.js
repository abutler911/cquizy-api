import chalk from "chalk";
import fs from "fs";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const filePath = "questions.json";
let currentCategory = "";
let currentContext = "";

const loadQuestions = () => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    console.log(chalk.blue("Existing questions loaded."));
    return JSON.parse(data);
  } catch (err) {
    console.log(
      chalk.yellow("No existing questions found. Creating a new file.")
    );
    return [];
  }
};

let questions = loadQuestions();

const setCategoryAndContext = () => {
  rl.question(chalk.green("Enter category: "), (category) => {
    if (!category.trim()) {
      console.log(
        chalk.red("Category cannot be blank. Please enter a valid category.")
      );
      return setCategoryAndContext();
    }
    rl.question(chalk.green("Enter context: "), (context) => {
      if (!context.trim()) {
        console.log(
          chalk.red("Context cannot be blank. Please enter a valid context.")
        );
        return setCategoryAndContext();
      }
      currentCategory = category;
      currentContext = context;
      console.log(chalk.cyan(`Category set to: ${currentCategory}`));
      console.log(chalk.cyan(`Context set to: ${currentContext}`));
      askQuestion();
    });
  });
};

const askQuestion = () => {
  rl.question(
    chalk.magenta(
      "Enter the question (or type 'exit' to finish, or 'change' to update category/context): "
    ),
    (questionText) => {
      if (questionText.toLowerCase() === "exit") {
        console.log(chalk.yellow("Saving questions..."));
        fs.writeFile(filePath, JSON.stringify(questions, null, 2), (err) => {
          if (err) {
            console.error(chalk.red("Error writing file:"), err);
          } else {
            console.log(
              chalk.green(`Questions successfully saved to ${filePath}`)
            );
          }
          rl.close();
        });
      } else if (questionText.toLowerCase() === "change") {
        setCategoryAndContext();
      } else if (!questionText.trim()) {
        console.log(
          chalk.red("Question cannot be blank. Please enter a valid question.")
        );
        askQuestion();
      } else {
        rl.question(chalk.blue("Enter the answer: "), (answer) => {
          if (!answer.trim()) {
            console.log(
              chalk.red("Answer cannot be blank. Please enter a valid answer.")
            );
            return askQuestion();
          }
          const questionNumber = questions.length + 1;
          questions.push({
            question: questionText,
            answer,
            category: currentCategory,
            context: currentContext,
            questionNumber,
          });
          console.log(chalk.green("✅ Question added successfully!"));
          askQuestion();
        });
      }
    }
  );
};

console.log(chalk.yellow("Welcome to the Question Entry System!"));
console.log(
  chalk.cyan(
    "You can enter questions one by one, and type 'exit' when you're done."
  )
);
console.log(
  chalk.magenta("Type 'change' at any time to update the category and context.")
);
setCategoryAndContext();
