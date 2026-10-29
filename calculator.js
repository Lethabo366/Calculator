const keys = document.querySelector(".calculator__keys");
const currentOperandElement = document.querySelector("#current-operand");
const previousOperandElement = document.querySelector("#previous-operand");

if (
  !keys ||
  !currentOperandElement ||
  !previousOperandElement ||
  typeof Calculator === "undefined"
) {
  throw new Error("Calculator markup or calculation logic is missing.");
}

const calculator = new Calculator(previousOperandElement, currentOperandElement);

const decimalButton = keys.querySelector('[data-action="decimal"]');

function fitCurrentOperand() {
  const element = currentOperandElement;
  element.style.fontSize = "";
  const maxSize = parseFloat(getComputedStyle(element).fontSize);
  const available = element.parentElement.clientWidth -
    parseFloat(getComputedStyle(element.parentElement).paddingLeft) -
    parseFloat(getComputedStyle(element.parentElement).paddingRight);
  if (element.scrollWidth > available) {
    element.style.fontSize = `${Math.floor(maxSize * (available / element.scrollWidth))}px`;
  }
}

function updateDisplay() {
  calculator.updateDisplay();
  fitCurrentOperand();
  decimalButton.disabled = !calculator.canAddDecimal();
}

function handleAction(action, value) {
  switch (action) {
    case "number":
    case "decimal":
      calculator.appendNumber(value);
      break;
    case "operator":
      calculator.chooseOperation(value);
      break;
    case "equals":
      calculator.compute();
      break;
    case "clear":
      calculator.clear();
      break;
    case "delete":
      calculator.delete();
      break;
    default:
      return;
  }

  updateDisplay();
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || !keys.contains(button)) return;
  handleAction(button.dataset.action, button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;

  if (/^\d$/.test(event.key)) {
    handleAction("number", event.key);
  } else if (event.key === "." || event.key === ",") {
    handleAction("decimal", ".");
  } else if (event.key === "Backspace") {
    handleAction("delete");
  } else if (event.key === "Escape" || event.key === "Delete") {
    handleAction("clear");
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    handleAction("equals");
  } else {
    const operators = {
      "+": "+",
      "-": "−",
      "*": "×",
      "/": "÷",
    };
    if (operators[event.key]) {
      event.preventDefault();
      handleAction("operator", operators[event.key]);
    }
  }
});

window.addEventListener("resize", fitCurrentOperand);

updateDisplay();