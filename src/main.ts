import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiRoute = 'api';
  app.use(helmet());
  app.useGlobalPipes(
    // setting global pipe to use dto's for validation
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // forbids extra value in request body/param
      transform: true, // transforms the dto object to use directly as class object
    }),
  );
  app.setGlobalPrefix(`${apiRoute}`);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('TTS API')
    .setDescription('TTS API Documentation')
    .setVersion('1.0')
    .addServer('http://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiRoute}/doc`, app, document);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
