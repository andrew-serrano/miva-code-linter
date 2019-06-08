// https://docs.miva.com/miva-template-language

// Constants

// Literals
const WHITESPACE = /\s/;
const NUMBERS = /[0-9]/;
const LETTERS = /[A-z]/;

// Variables
const VARIABLE_PREFIX = /[glsd]/;
// TODO: Variables may consist of dashes -
const VARIABLE_NAME = /[A-z_0-9]/;

function tokenizer(input) {
  if (!input) throw new Error("No input provided");

  let counter = 0;
  let tokens = [];

  while (counter < input.length) {
    // counter Character
    let char = input[counter];

    // Token Object
    let token = {
      type: null,
      value: char
    }

    // Left Carrot
    if (char === '<') {
      let value = '';
      char = input[++counter];

      while (char !== " ") {
        value += char;
        char = input[++counter];
      }

      token.type = "open_tag";
      token.value = value;
      tokens.push(token);

      continue;
    }

    // Divide Operator or Self Closing
    if (char === "/") {
      let value = char;
      char = input[++counter];

      // Divide Operator
      if (char !== ">") {
        token.type = "divide";
      }

      // Self closing tag
      if (char === ">") {
        value += char;
        token.type = "self_close";
      }

      token.value = value;
      tokens.push(token);
      counter++;
      continue;
    }

    // Attributes
    if (LETTERS.test(char)) {
      let value = '';

      while (char !== '=') {
        value += char;
        char = input[++counter];
      }

      token.type = "attribute";
      token.value = value;
      tokens.push(token);

      continue;
    }

    // Variable
    if (char === '"') {
      let value = '';
      char = input[++counter];

      // prefix
      if (!LETTERS.test(char)) continue;

      value += char;
      char = input[++counter];

      // After prefix
      if (char !== ".") continue;

      value += char;
      char = input[++counter];

      // Variable Name
      // TODO: Leave this check to the parser. May this cause errors?
      while (VARIABLE_NAME.test(char) && char !== '"') {
        value += char;
        char = input[++counter];
      }

      token.type = "variable"
      token.value = value;
      tokens.push(token);
      continue;
    }

    // Equal
    if (char === '=') {
      token.type = "equal";
      tokens.push(token);
      counter++;
      continue;
    }

    // Whitespace
    if (WHITESPACE.test(char)) {
      counter++;
      continue;
    }

    // Number
    if (NUMBERS.test(char)) {
      let value = '';

      while (NUMBERS.test(char)) {
        value += char;
        char = input[++counter];
      }

      token.type = "number";
      token.value = value;
      tokens.push(token);
      continue;
    }

    // Add
    if (char === "+") {
      token.type = "add";
      token.value = char;
      tokens.push(token);
      counter++;
      continue;
    }

    // Subtract
    if (char === "-") {
      token.type = "subtract";
      token.value = char;
      tokens.push(token);
      counter++;
      continue;
    }

    // Multiply
    if (char === "*") {
      token.type = "multiply";
      token.value = char;
      tokens.push(token);
      counter++;
      continue;
    }

    if (char === "(" || char === ")") {
      token.type = "parentheses";
      token.value = char;
      tokens.push(token);
      counter++;
      continue;
    }

    // String
    if (char === '\'') {
      let value = '';
      char = input[++counter];

      while (char !== '\'') {
        value += char;
        char = input[++counter];
      }

      token.type = "string";
      token.value = value;
      tokens.push(token);

      counter++;
      continue;
    }


    console.log(tokens)
    throw new TypeError('I dont know what this character is: ' + char);
  }
  return tokens;
}

// Tests
let testNumber = `<mvt:assign name="l.variable" value="1" />`;
let testString = `<mvt:assign name="l.variable" value="'Hello World'" />`;
let testVariable = `<mvt:assign name="l.variable" value="a.A_s_23123123_S" />`;
let testNULL = `<mvt:assign name="l.variable" value="''" />`;
let testExpression = `<mvt:assign name="l.variable" value="1 / (2 + 1)" />`;

console.log(
  // "NUMBER", tokenizer(testNumber),
  // "\n\nSTRING", tokenizer(testString),
  // "\n\nVARIABLE", tokenizer(testVariable),
  // "\n\nNULL", tokenizer(testNULL),
  "\n\nExpressions", tokenizer(testExpression),
)