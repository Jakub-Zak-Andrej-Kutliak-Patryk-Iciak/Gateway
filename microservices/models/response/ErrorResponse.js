import chalk from "chalk";

export default class ErrorResponse {
  error;
  displayError;

  constructor(error, displayError) {
    this.error = error
    this.displayError = displayError
  }

  getError = () => {
    return this.error
  }
  getDisplayError = () => {
    return this.displayError
  }
  setError = (error) => {
    this.error = error
  }
  setDisplayError = (error) => {
    this.displayError = error
  }

  format = () => {
    console.error(chalk.red(`ERROR: ${this.getDisplayError() ?? this.getError()}`))
    return { error: this.getError() }
  }
}