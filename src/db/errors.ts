export class EmptyFieldError extends Error {
  constructor(prop: string) {
    super(`${prop} should not be empty`);
  }
}