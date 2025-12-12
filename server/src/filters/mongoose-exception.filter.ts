import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Error as MongooseError } from 'mongoose';

/**
 * Exception filter to handle Mongoose validation errors
 * and return proper HTTP responses instead of 500 errors
 */
@Catch(MongooseError.ValidationError, MongooseError.CastError)
export class MongooseExceptionFilter implements ExceptionFilter {
  catch(exception: MongooseError.ValidationError | MongooseError.CastError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof MongooseError.ValidationError) {
      // Handle validation errors
      const errors = Object.values(exception.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));

      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors,
      });
    } else if (exception instanceof MongooseError.CastError) {
      // Handle invalid ObjectId or type casting errors
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Invalid ${exception.kind} for field '${exception.path}'`,
        error: 'Bad Request',
      });
    }
  }
}
