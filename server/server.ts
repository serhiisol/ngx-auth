import { Controller, Get, Module, Post, Res } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Response } from 'express';

@Controller()
class AppController {
  private passData = false;

  @Get('/data')
  async getData(@Res() res: Response) {
    this.passData = !this.passData;

    if (this.passData) {
      res.send([
        {
          'id': 1,
          'name': 'Pepsi',
        },
        {
          'id': 2,
          'name': 'Coca-Cola',
        },
      ]);
    } else {
      // emulate long request
      const { promise, resolve } = Promise.withResolvers();

      setTimeout(resolve, 300);

      await promise;

      res.status(401).send([]);
    }
  }

  @Post('/login')
  login() {
    return this.generateTokens();
  }

  @Post('/refresh')
  async refresh() {
    // emulate long request
    const { promise, resolve } = Promise.withResolvers();

    setTimeout(resolve, 1000);

    await promise;

    return this.generateTokens();
  }

  private generateTokens() {
    return {
      accessToken: `access-token-${Math.random()}`,
      refreshToken: `access-token-${Math.random()}`,
    };
  }
}


@Module({
  controllers: [AppController],
})
class AppModule { }

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  await app.listen(3000);
  console.log('Server is running on http://localhost:3000');
}

bootstrap().catch(console.error);


