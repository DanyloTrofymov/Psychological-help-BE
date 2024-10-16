import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: (origin, cb) => {
			if (origin == undefined || origin.includes(process.env.BASE_URL)) {
				console.log('allowed cors for:', origin);
				cb(null, true);
			} else {
				cb(new Error('Not allowed'), false);
			}
		},
		credentials: true,
		allowedHeaders:
			'Accept, Content-Type, Authorization, X-Requested-With, Content-Length, Origin, X-Powered-By, User-Agent, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods'
	});
	app.useWebSocketAdapter(new IoAdapter(app));
	await app.listen(3001);
}
bootstrap();
