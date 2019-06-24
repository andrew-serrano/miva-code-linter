// https://docs.miva.com/miva-template-language

// Literals
const WHITESPACE = /\s/;
const NUMBERS = /[0-9\.]/;
const LETTERS = /[A-z]/;

// Variables
const VARIABLE_PREFIX = /[glsd]/;
// TODO: Variables may consist of dashes -
const VARIABLE_NAME = /[A-z_0-9\:\[\]]/;

// This is used to let us know when we are in a miva tag
// using this flag will let us avoid unwanted characters/noise
let TAG_FLAG = false;

function tokenizer(input) {
  // Error
  if (!input) throw new Error("No input provided");

  // Defaults
  let counter = 0;
  let tokens = [];

  // Iterate over input
  while (counter < input.length) {
    // Counter character
    let char = input[counter];

    // Token Object
    let token = {
      type: null,
      value: char
    }

    // Miva Tags - Start
    // Open/Close Tag
    if (char === '<') {
      let value = '';
      let valueToCompare = ' ';

      // Default open tag
      token.type = "open_tag";
      char = input[++counter];

      // Close Tag
      if (char === "/") {
        char = input[++counter];
        valueToCompare = ">"
        token.type = "close_tag";
      }

      if (char === "m") {
        value += char;
        char = input[++counter];
      }

      if (char === "v") {
        value += char;
        char = input[++counter];
      }

      if (char === "t") {
        value += char;
        char = input[++counter];
      }

      // Not MVT
      if (char !== ":") {
        TAG_FLAG = false;
        continue;
      };

      // MVT Tag
      TAG_FLAG = true;

      while (char !== valueToCompare) {
        value += char;
        char = input[++counter];

        // mvt:else/elseif
        // TODO: Too explicit or let theses be identified as something else?
        if (value === "mvt:else") {
          // mvt:else
          if (char === ">") {
            token.type = "else_tag";
            valueToCompare = '>';
          }

          // mvt:elseif
          if (char === "i") {
            token.type = "elseif_tag";
            valueToCompare = ' ';
          }
        }

        // TODO: Do we care about comments?
        if (value === "mvt:comment") {
          token.type = "comment_tag";
          valueToCompare = ">";
        }
      }

      // mvt:if
      if (value === "mvt:if") {
        token.type = "if_tag";
      }

      // mvt:assign
      if (value === "mvt:assign") {
        token.type = "assign_tag";
      }

      // mvt:eval
      if (value === "mvt:eval") {
        token.type = "eval_tag";
      }

      // mvt:do
      if (value === "mvt:do") {
        token.type = "do_tag";
      }

      // Skip over this character
      // TODO: Do we need?
      if (char === ">") {
        counter++;
      }

      token.value = value;
      tokens.push(token);

      continue;
    }

    // Don't continue unless we are in a miva tag
    if (!TAG_FLAG) {
      counter++;
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

    // Functions/Attributes
    if (LETTERS.test(char)) {
      let value = '';
      let valueToCompare = "=";

      // Default
      token.type = "attribute";

      while (char !== valueToCompare) {
        value += char;
        char = input[++counter];

        // Functions
        if (char === "(") {
          token.type = "name";
          valueToCompare = "(";
        }
      }

      token.value = value;
      tokens.push(token);
      continue;
    }
    // Miva Tags - End

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

      // Increase
      char = input[++counter];

      // Skip over this character
      // TODO: Do we need?
      if (char === ">") {
        counter++;
      }

      continue;
    }

    // Whitespace
    if (WHITESPACE.test(char)) {
      counter++;
      continue;
    }

    // Parenthesis
    if (char === '(' || char === ')') {
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
        TAG_FLAG = false;
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
let testMvtDo = `<mvt:do file="g.module_library_utilities" name="g.email_sent" value="SendEmail()"/>`;
let testFunction = `<mvt:assign name="l.date" value="abs( 1.00 + 1
 )" />`;
let testCommment = `
<mvt:comment>
</mvt:comment>
<mvt:assign name="l.variable" value="1" />
`;
let testString = `<mvt:assign name="l.variable" value="'Hello World'" />`;
let testVariable = `<mvt:assign name="l.variable" value="g.woot" />`;
let testVariableStruct = `<mvt:assign name="l.variable:woot" value="g.woot:noway" />`;
let testVariableArray = `<mvt:assign name="l.variable[1][2]" value="g.woot[1][3][4]" />`;
let testNULL = `<mvt:assign name="l.variable" value="''" />`;
let testExpression = `<mvt:assign name="l.variable" value="(1 / (2 + 1))" />`;
let testCurrency = `<mvt:assign name="l.variable" value="'$1.00' $ 'Woot'" />`;
let testIfStatement = `
<mvt:if expr="1 + 2">
</mvt:if>
`;
let testIfElseStatement = `
<mvt:if expr="1 + 2">
<mvt:else>
</mvt:if>
`;
let testIfElseIfStatement = `
<mvt:if expr="1 + 2">
<mvt:elseif expr="1 + 2">
<mvt:else>
</mvt:if>
`;
let testTemplate = `
<p>Hello World!</p>
<mvt:assign name="l.variable" value="'$1.00' $ 'Woot'" />
woot I can't believe this works
<div>HELLO MANG WADDUP</div>
<mvt:eval expr="l.empty + 1" />
`;

console.log(tokenizer(testFunction))