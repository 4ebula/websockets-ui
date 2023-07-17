export class EmptyFieldError extends Error {
  constructor(prop: string) {
    super(`${prop} should not be empty`);
  }
}

export class WrongPassword extends Error {
  constructor() {
    super('Wrong password');
  }
}

export class AlreadyLogged extends Error {
  constructor() {
    super('You are already logged in');
  }
}