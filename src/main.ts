import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    // setting global pipe to use dto's for validation
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // forbids extra value in request body/param
      transform: true, // transforms the dto object to use directly as class object
    }),
  );
  app.setGlobalPrefix('api');
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
