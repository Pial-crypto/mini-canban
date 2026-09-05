import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import dotenv from 'dotenv';
  import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes/index.js';
import { NextFunction } from 'express';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

const config = new DocumentBuilder()
  .setTitle('CanbaBoard API')
  .setDescription('CanbaBoard backend API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup('api/docs', app, document);
  app.use((req: Request, res: Response, next: NextFunction) => {
    // console.log('REQUEST:', req.method, req.url);
      // console.log('REQUEST:', req.method, req);
  // console.log('AUTH HEADER:', req.headers);
    next();
  });
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  await app.listen(port);
// console.log("checking environment variables", process.env.NODE_ENV, process.env.DATABASE_URL, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN);
   // console.log(`Backend listening on http://localhost:${port}/api`);
}
await bootstrap();



