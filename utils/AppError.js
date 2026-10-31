export class AppError extends Error {
  statusCode;
  name;

  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
