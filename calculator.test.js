const test = require("node:test");
const assert = require("node:assert/strict");
const Calculator = require("./calculator.logic.js");
const { add, subtract, multiply, divide, operate } = Calculator;

test("add, subtract, multiply and divide", () => {
  assert.equal(add(2, 3), 5);
  assert.equal(subtract(2, 3), -1);
  assert.equal(multiply(2, 3), 6);
  assert.equal(divide(6, 3), 2);
  assert.equal(divide(1, 0), Infinity);
});

test("operate dispatches on the operator", () => {
  assert.equal(operate("+", 2, 3), 5);
  assert.equal(operate("-", 2, 3), -1);
  assert.equal(operate("*", 2, 3), 6);
  assert.equal(operate("/", 6, 3), 2);
  assert.equal(operate("÷", 6, 3), 2);
  assert.throws(() => operate("%", 1, 2), /Unsupported operator/);
});

function createCalculator() {
  const previous = { textContent: "" };
  const current = { textContent: "" };
  return { calculator: new Calculator(previous, current), previous, current };
}

function press(calculator, ...inputs) {
  for (const input of inputs) {
    if (input === "AC") calculator.clear();
    else if (input === "DEL") calculator.delete();
    else if (input === "=") calculator.compute();
    else if (["+", "−", "×", "÷"].includes(input)) calculator.chooseOperation(input);
    else calculator.appendNumber(input);
  }
}

test("performs each basic operation", () => {
  const cases = [
    [["8", "+", "2", "="], "10"],
    [["8", "−", "2", "="], "6"],
    [["8", "×", "2", "="], "16"],
    [["8", "÷", "2", "="], "4"],
  ];
  for (const [inputs, expected] of cases) {
    const { calculator } = createCalculator();
    press(calculator, ...inputs);
    assert.equal(calculator.currentOperand, expected);
  }
});

test("avoids floating point artifacts", () => {
  const { calculator } = createCalculator();
  press(calculator, "0", ".", "1", "+", "0", ".", "2", "=");
  assert.equal(calculator.currentOperand, "0.3");
});

test("chains operations left to right", () => {
  const { calculator } = createCalculator();
  press(calculator, "2", "+", "3", "×", "4", "=");
  assert.equal(calculator.currentOperand, "20");
});

test("allows only one decimal point and prefixes a leading zero", () => {
  const { calculator } = createCalculator();
  press(calculator, ".", "5", ".", "2");
  assert.equal(calculator.currentOperand, "0.52");

  press(calculator, "+", ".");
  assert.equal(calculator.currentOperand, "0.");
});

test("replaces the leading zero and ignores repeated zeros", () => {
  const { calculator } = createCalculator();
  press(calculator, "0", "0", "7");
  assert.equal(calculator.currentOperand, "7");
});

test("delete removes digits and falls back to zero", () => {
  const { calculator } = createCalculator();
  press(calculator, "1", "2", "DEL");
  assert.equal(calculator.currentOperand, "1");
  press(calculator, "DEL");
  assert.equal(calculator.currentOperand, "0");
  press(calculator, "DEL");
  assert.equal(calculator.currentOperand, "0");
});

test("clear resets all state", () => {
  const { calculator } = createCalculator();
  press(calculator, "9", "+", "1", "AC");
  assert.equal(calculator.currentOperand, "0");
  assert.equal(calculator.previousOperand, "");
  assert.equal(calculator.operation, undefined);
});

test("division by zero shows an error and recovers on next input", () => {
  const { calculator, current } = createCalculator();
  press(calculator, "5", "÷", "0", "=");
  calculator.updateDisplay();
  assert.equal(current.textContent, "Nice try!");

  press(calculator, "3");
  calculator.updateDisplay();
  assert.equal(current.textContent, "3");
});

test("evaluates one pair at a time: 12 + 7 - 5 * 3 = 42", () => {
  const { calculator } = createCalculator();
  press(calculator, "1", "2", "+", "7", "−", "5", "×", "3", "=");
  assert.equal(calculator.currentOperand, "42");
});

test("pressing = with nothing pending or an incomplete pair changes nothing", () => {
  const { calculator } = createCalculator();
  press(calculator, "=");
  assert.equal(calculator.currentOperand, "0");
  press(calculator, "7", "+", "=");
  assert.equal(calculator.currentOperand, "7");
  assert.equal(calculator.operation, "+");
});

test("rounds long decimals and keeps tiny results readable", () => {
  const { calculator, current } = createCalculator();
  press(calculator, "1", "÷", "3", "=");
  assert.equal(calculator.currentOperand, "0.333333333333");

  press(calculator, "AC", "1", "÷", "1", "0", "0", "0", "0", "0", "0", "0", "=");
  calculator.updateDisplay();
  assert.equal(current.textContent, "1e-7");
});

test("limits typed digits so numbers fit the display", () => {
  const { calculator } = createCalculator();
  press(calculator, ..."12345678901234567890".split(""));
  assert.equal(calculator.currentOperand, "123456789012");
});

test("a second operator evaluates the first pair and shows the result", () => {
  const { calculator, previous, current } = createCalculator();
  press(calculator, "1", "2", "+", "7", "−");
  calculator.updateDisplay();
  assert.equal(current.textContent, "19");
  assert.equal(previous.textContent, "19 −");
});

test("decimal is only allowed when the display has none", () => {
  const { calculator } = createCalculator();
  assert.equal(calculator.canAddDecimal(), true);
  press(calculator, "1", ".", "2");
  assert.equal(calculator.canAddDecimal(), false);
  press(calculator, "+");
  assert.equal(calculator.canAddDecimal(), true);
  press(calculator, "3", ".");
  assert.equal(calculator.canAddDecimal(), false);
  press(calculator, "DEL");
  assert.equal(calculator.canAddDecimal(), true);
});

test("changing the operator before a second operand keeps the first operand", () => {
  const { calculator } = createCalculator();
  press(calculator, "6", "+", "×", "2", "=");
  assert.equal(calculator.currentOperand, "12");
});

test("starts a new number after a result", () => {
  const { calculator } = createCalculator();
  press(calculator, "2", "+", "2", "=", "5");
  assert.equal(calculator.currentOperand, "5");
});

test("display formats thousands and shows the pending operation", () => {
  const { calculator, previous, current } = createCalculator();
  press(calculator, "1", "2", "3", "4", "5", ".", "5", "×");
  calculator.updateDisplay();
  assert.equal(previous.textContent, "12,345.5 ×");
  assert.equal(current.textContent, "12,345.5");
});
