// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import SQLiteStoreFactory from 'connect-sqlite3';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Project Management API')
    .setDescription(
      'REST API Project & Task dengan session-based authentication',
    )
    .setVersion('1.0')
    .addCookieAuth('nest_session', {
      type: 'apiKey',
      in: 'cookie',
      name: 'nest_session',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const SQLiteStore = SQLiteStoreFactory(session);

  app.use(
    session({
      name: process.env.SESSION_NAME || 'nest_session',
      secret: process.env.SESSION_SECRET || 'default-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60,
      },
      store: new SQLiteStore({
        db: 'sessions.sqlite',
      }),
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use('/css', express.static(join(__dirname, '..', 'src/public/css')));
  app.use('/js', express.static(join(__dirname, '..', 'src/public/js')));

  app.setViewEngine('ejs');
  app.setBaseViewsDir(join(__dirname, '..', 'src/views'));

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();