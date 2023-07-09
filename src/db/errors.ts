export class EmptyFieldError extends Error {
  constructor(prop: string) {
    super(`${prop} should not be empty`);
  }
}

export class DuplicatedUser extends Error {
  constructor() {
    super('User already exists');
  }
}