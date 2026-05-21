import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // אל תשכחי להוסיף את זה!

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // זה חייב להיות בתוך ה-bootstrap לפני ה-listen
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true 
  }));

  await app.listen(3000);
}
bootstrap();