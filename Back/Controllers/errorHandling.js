class ErrorHandling extends Error {
    constructor(msg, statusCode){
        super(msg);

        // (error between 400 and 499) ? (status : fail) : (status : error)
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.statusCode = statusCode;
    }
}

// used for invalid param
class handleCastErrorDB extends ErrorHandling {

    constructor(statusCode, path, value){
        super(`invalid ${path} : ${value}.`, statusCode);
    }
}


// used for unique validator
class handleDuplicateFieldsDB extends ErrorHandling {

    constructor(statusCode, key, value){
        super(`${key} : ${value}, already exist. ${key} must be unique`, statusCode); 
    }
}


class handleUserNotFound extends ErrorHandling {

    constructor(msg, statusCode) {
        super(msg, statusCode);
        this.name = 'UserNotFound'
    }
}


// called on error midleware (in any error, the following function will be called)
const errorHandlingMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500; // 500 means internal server error
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development')
    {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }
    else {
        res.status(err.statusCode).json({
            status: err.status,
            error : err,
            message: err.message
        })
    }
}


module.exports = {
    ErrorHandling,
    handleCastErrorDB,
    handleDuplicateFieldsDB,
    handleUserNotFound,
    errorHandlingMiddleware
}