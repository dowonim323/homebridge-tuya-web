export class UnsupportedOperationError extends Error {
  constructor(message: string, reason?: string) {
    if (reason) {
      message += ` - ${reason}`;
    }

    super(message);
  }
}
