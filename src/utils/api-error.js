class ApiError extends Error {
  contructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message)
    this.statusCode = statusCode,
      this.data = null,
      this.message = message,
      this.success = false,
      this.erorrs = errors
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.contructor)
    }
  }
}


export { ApiError }