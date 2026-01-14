class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went Wrong",
    errors = [],
    stack = "",
  ) {
    super(message); //calling the constructor of the prent class
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if(stack){
        this.stack = stack
    }else{
        Error.captureStackTrace(this, this.constructor)
    }
  }
}

export {ApiError}
