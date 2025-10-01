class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode
    this.data = data
    this.message = message || "Success"
    this.success = statusCode < 400
  }
}


export { ApiResponse };