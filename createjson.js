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

const categories = [
  "1.0 - Pre-Departure Ground Operations",
  "2.0 - Takeoff",
  "3.0 - Climb",
  "4.0 - Cruise",
  "5.0 - Descent",
  "6.0 - Approach/Missed Approach",
  "7.0 - Landing",
  "8.0 - After Landing",
];

const contexts = [
  "Cold, dark flight deck, batteries 1 & 2 selected on.",
  "AC electrical power is established, safety and power-up checklist is complete.",
  "Originating and Before Start",
  "Engine Start and Pushback",
  "After Start, Taxi, and Before Takeoff",
];

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

const selectFromList = (promptText, list, callback) => {
  console.log(chalk.green(`\n${promptText}`));
  list.forEach((item, index) => {
    console.log(chalk.cyan(`${index + 1}. ${item}`));
  });

  rl.question(chalk.green("\nSelect a number: "), (choice) => {
    const index = parseInt(choice) - 1;
    if (index >= 0 && index < list.length) {
      callback(list[index]);
    } else {
      console.log(chalk.red("Invalid selection. Try again."));
      selectFromList(promptText, list, callback);
    }
  });
};

const setCategoryAndContext = () => {
  selectFromList("Choose a category:", categories, (selectedCategory) => {
    currentCategory = selectedCategory;
    console.log(chalk.cyan(`Category set to: ${currentCategory}`));

    selectFromList("Choose a context:", contexts, (selectedContext) => {
      currentContext = selectedContext;
      console.log(chalk.cyan(`Context set to: ${currentContext}`));
      askQuestion();
    });
  });
};

const askQuestion = () => {
  rl.question(
    chalk.magenta(
      "Enter the question (or type 'exit' to finish, 'review' to view questions, or 'change' to update category/context): "
    ),
    (questionText) => {
      if (questionText.toLowerCase() === "exit") {
        confirmAndSave();
        return;
      } else if (questionText.toLowerCase() === "change") {
        return setCategoryAndContext();
      } else if (questionText.toLowerCase() === "review") {
        return reviewQuestions();
      } else if (!questionText.trim()) {
        console.log(
          chalk.red("Question cannot be blank. Please enter a valid question.")
        );
        return askQuestion();
      }

      rl.question(chalk.blue("Enter the answer: "), (answer) => {
        if (!answer.trim()) {
          console.log(
            chalk.red("Answer cannot be blank. Please enter a valid answer.")
          );
          return askQuestion();
        }
        const questionNumber = questions.length + 1;
        questions.push({
          questionNumber,
          question: questionText,
          answer,
          category: currentCategory,
          context: currentContext,
        });
        console.log(chalk.green("✅ Question added successfully!"));
        askQuestion();
      });
    }
  );
};

const reviewQuestions = () => {
  if (questions.length === 0) {
    console.log(chalk.yellow("No questions entered yet."));
  } else {
    console.log(chalk.green("\nHere are your entered questions:\n"));
    questions.forEach((q) => {
      console.log(
        chalk.cyan(
          `#${q.questionNumber} [${q.category} - ${q.context}]\n  Q: ${q.question}\n  A: ${q.answer}\n`
        )
      );
    });
  }
  askQuestion();
};

const confirmAndSave = () => {
  if (questions.length === 0) {
    console.log(chalk.yellow("No questions to save."));
    rl.close();
    process.exit(0); // Ensures the program exits completely
    return;
  }

  rl.question(
    chalk.green("Would you like to save these questions? (yes/no): "),
    (answer) => {
      if (answer.toLowerCase() === "yes") {
        console.log(chalk.yellow("Saving questions..."));
        fs.writeFile(filePath, JSON.stringify(questions, null, 2), (err) => {
          if (err) {
            console.error(chalk.red("Error writing file:"), err);
          } else {
            console.log(
              chalk.green(`✅ Questions successfully saved to ${filePath}`)
            );
          }
          rl.close();
          process.exit(0);
        });
      } else {
        console.log(chalk.red("⚠️ Questions not saved. Exiting..."));
        rl.close();
        process.exit(0);
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
console.log(
  chalk.blue("Type 'review' to see all entered questions before saving.")
);
setCategoryAndContext();
