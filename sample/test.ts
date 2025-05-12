// TODO: この関数を最適化する
function add(a: number, b: number): number {
  return a + b;
}

// FIXME: エラーハンドリングを追加する
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}

// 通常のコメント
function multiply(a: number, b: number): number {
  return a * b;
}

/**
 * TODO この関数を最適化する 
 * @param name - The name of the person to greet
 * @returns A greeting message
 */
function greet(name: string): string {
  return `Hello, ${name}!`;
}

function message(): string {
  const name = 'John Doe'; // TODO: Use a more descriptive name
  return `Hello, ${name}!`;
}

// TODO: 40文字以上の長いコメントをテストする. この関数は1から100までの数値を処理し、条件に応じて"Fizz", "Buzz", "FizzBuzz"または数値を出力します
function fizzBuzz(): void {
  for (let i = 1; i <= 100; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      console.log("FizzBuzz");
    } else if (i % 3 === 0) {
      console.log("Fizz");
    } else if (i % 5 === 0) {
      console.log("Buzz");
    } else {
      console.log(i);
    }
  }
}



