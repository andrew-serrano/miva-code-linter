// https://docs.miva.com/miva-template-language

// Constants

// Literals
const WHITESPACE = /\s/;
const NUMBERS = /[0-9]/;
const LETTERS = /[A-z]/;

// Variables
const VARIABLE_PREFIX = /[glsd]/;
// TODO: Variables may consist of dashes -
const VARIABLE_NAME = /[A-z_0-9\:\[\]]/;

function tokenizer(input) {
  // Error
  if (!input) throw new Error("No input provided");

  // Defaults
  let counter = 0;
  let tokens = [];

  // Iterate over input
  while (counter < input.length) {
    // counter Character
    let char = input[counter];

    // Token Object
    let token = {
      type: null,
      value: char
    }

    // Miva Tags - Start
    // Open Tag
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

    // Variables
    if (VARIABLE_PREFIX.test(char)) {
      let value = char;
      char = input[++counter];

      if (char !== '.') continue;

      value += char;
      char = input[++counter];

      while (VARIABLE_NAME.test(char)) {
        value += char;
        char = input[++counter];
      }

      token.type = "variable"
      token.value = value;
      tokens.push(token);
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
    // Miva Tags - End

    // Characters - Start
    // Equal
    if (char === '=') {
      token.type = "equal";
      tokens.push(token);
      counter++;
      continue;
    }

    // Quote
    if (char === '"') {
      token.type = "quote";
      tokens.push(token);
      counter++;
      continue;
    }

    // Whitespace
    if (WHITESPACE.test(char)) {
      counter++;
      continue;
    }

    // Parenthesis
    if (char === "(" || char === ")") {
      token.type = "parentheses";
      tokens.push(token);
      counter++;
      continue;
    }
    // Characters - End

    // Data types - Start
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
    // Data types - End

    // Operators - Start
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

    // Concat
    if (char === '$') {
      token.type = "concat";
      tokens.push(token);
      counter++;
      continue;
    }

    // Add
    if (char === '+') {
      token.type = "add";
      tokens.push(token);
      counter++;
      continue;
    }

    // Subtract
    if (char === '-') {
      token.type = "subtract";
      tokens.push(token);
      counter++;
      continue;
    }

    // Multiply
    if (char === '*') {
      token.type = "multiply";
      tokens.push(token);
      counter++;
      continue;
    }
    // Operators - End

    console.log(tokens)
    throw new TypeError('I dont know what this character is: ' + char);
  }
  return tokens;
}

// Tests
let testNumber = `<mvt:assign name="l.variable" value="1" />`;
let testString = `<mvt:assign name="l.variable" value="'Hello World'" />`;
let testVariable = `<mvt:assign name="l.variable" value="g.woot" />`;
let testVariableStruct = `<mvt:assign name="l.variable:woot" value="g.woot:noway" />`;
let testVariableArray = `<mvt:assign name="l.variable[1][2]" value="g.woot[1][3][4]" />`;
let testNULL = `<mvt:assign name="l.variable" value="''" />`;
let testExpression = `<mvt:assign name="l.variable" value="(1 / (2 + 1))" />`;
let testCurrency = `<mvt:assign name="l.variable" value="'$1.00' $ 'Woot'" />`;

console.log(
  // "NUMBER", tokenizer(testNumber),
  // "\n\nSTRING", tokenizer(testString),
  // "\n\nVARIABLE", tokenizer(testVariable),
  // "\n\nNULL", tokenizer(testNULL),
  "\n\nExpressions", tokenizer(testCurrency),
)