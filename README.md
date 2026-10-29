# Calculator
A simple interactive calculator built with HTML, CSS, and JavaScript, featuring basic arithmetic operations, decimal input, keyboard support, and error handling.

## Usage

Open `index.html` in a browser. No build step or dependencies are required.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `0`–`9` | Enter digits |
| `.` or `,` | Decimal point |
| `+` `-` `*` `/` | Add, subtract, multiply, divide |
| `Enter` or `=` | Calculate |
| `Backspace` | Delete the last digit |
| `Escape` or `Delete` | Clear everything |

## Project structure

- `index.html` – markup for the display and keys
- `style.css` – layout and visual design
- `calculator.logic.js` – the `Calculator` class (state and arithmetic)
- `calculator.js` – wires buttons and keyboard events to the logic
- `calculator.test.js` – unit tests for the logic

## Tests

Requires Node.js 18 or newer.

```sh
npm test
```