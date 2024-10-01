import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for all origins
  await app.listen(8082);
}
bootstrap();


// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   const port = process.env.PORT || 8082;
//   await app.listen(port, () => console.log(`Server running on port ${port}`));
// }
// bootstrap();
