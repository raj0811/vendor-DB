import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const port =  process.env.PORT || 4000
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port, () => {
    console.log(
      `\x1b[1m\x1b[32m>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SERVICE STARTED ON PORT \x1b[33m${port}\x1b[32m <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<\x1b[0m`,
    );
  });
}
bootstrap();
