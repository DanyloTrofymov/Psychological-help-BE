import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, cb) => {
      if (origin == undefined || origin.includes(process.env.BASE_URL!)) {
        cb(null, true)
      } else {
        cb(new Error("Not allowed"), false)
      }
    },
    credentials: true,
    allowedHeaders: "Accept, Content-Type, Authorization, X-Requested-With, Content-Length, Origin, X-Powered-By, User-Agent",
  });
  await app.listen(3001);
}
bootstrap();
