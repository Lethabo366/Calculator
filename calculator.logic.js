function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  return a / b;
}

const OPERATIONS = {
  "+": add,
  "−": subtract,
  "×": multiply,
  "÷": divide,
  "-": subtract,
  "*": multiply,
  "/": divide,
};

const DIVIDE_BY_ZERO_MESSAGE = "Nice try!";
const MAX_INPUT_DIGITS = 12;

function operate(operator, a, b) {
  if (!Object.hasOwn(OPERATIONS, operator)) {
    throw new Error(`Unsupported operator: ${operator}`);
  }
  return OPERATIONS[operator](a, b);
}

class Calculator {
  constructor(previousOperandElement, currentOperandElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.clear();
  }

  clear() {
    this.currentOperand = "0";
    this.previousOperand = "";
    this.operation = undefined;
    this.shouldResetScreen = false;
    this.error = "";
  }

  delete() {
    if (this.error) {
      this.clear();
      return;
    }

    if (this.shouldResetScreen) {
      this.currentOperand = "0";
      this.shouldResetScreen = false;
      return;
    }

    this.currentOperand =
      this.currentOperand.length > 1
        ? this.currentOperand.slice(0, -1)
        : "0";

    if (this.currentOperand === "-") {
      this.currentOperand = "0";
    }
  }

  appendNumber(number) {
    if (this.error) this.clear();
    if (this.shouldResetScreen) {
      this.currentOperand = number === "." ? "0." : number;
      this.shouldResetScreen = false;
      return;
    }

    if (number === "." && this.currentOperand.includes(".")) return;
    if (this.currentOperand === "0" && number !== ".") {
      this.currentOperand = number;
      return;
    }

    if (this.currentOperand.replace(/\D/g, "").length >= MAX_INPUT_DIGITS) return;

    this.currentOperand += number;
  }

  chooseOperation(operation) {
    if (!Object.hasOwn(OPERATIONS, operation)) return;
    if (this.error) this.clear();

    if (this.operation && !this.shouldResetScreen) {
      this.compute();
      if (this.error) return;
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.shouldResetScreen = true;
  }

  compute() {
    if (!this.operation || this.shouldResetScreen) return;

    const result = operate(
      this.operation,
      Number(this.previousOperand),
      Number(this.currentOperand),
    );

    if (!Number.isFinite(result)) {
      this.error = DIVIDE_BY_ZERO_MESSAGE;
      this.currentOperand = "0";
      this.previousOperand = "";
      this.operation = undefined;
      this.shouldResetScreen = true;
      return;
    }

    this.currentOperand = String(Number(result.toPrecision(12)));
    this.previousOperand = "";
    this.operation = undefined;
    this.shouldResetScreen = true;
  }

  canAddDecimal() {
    return this.shouldResetScreen || !this.currentOperand.includes(".");
  }

  getDisplayNumber(number) {
    if (number.includes("e")) return number;
    const [integer, decimal] = number.split(".");
    const formattedInteger = Number(integer).toLocaleString("en-US", {
      maximumFractionDigits: 0,
    });
    return decimal === undefined
      ? formattedInteger
      : `${formattedInteger}.${decimal}`;
  }

  updateDisplay() {
    this.currentOperandElement.textContent = this.error
      ? this.error
      : this.getDisplayNumber(this.currentOperand);
    this.previousOperandElement.textContent = this.operation
      ? `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`
      : "";
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = Calculator;
  Object.assign(module.exports, { add, subtract, multiply, divide, operate });
}