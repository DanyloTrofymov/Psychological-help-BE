import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException
} from '@nestjs/common';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();

		// Handle the exception as needed
		let status, message;
		if (exception instanceof HttpException) {
			status = exception.getStatus();
			message = exception.getResponse();
		} else if (exception instanceof PrismaClientValidationError) {
			const errorArray = exception.message.split('\n');
			status = 400;
			message = errorArray[errorArray.length - 1];
		} else if (exception instanceof Error) {
			status = 400;
			message = exception.name;
		} else {
			status = 500;
			message = 'Internal Server Error';
		}

		// Customize your error response structure:
		response.status(status).json({
			statusCode: status,
			message: message
			// Add other details like timestamp, path, etc., if desired
		});
	}
}
