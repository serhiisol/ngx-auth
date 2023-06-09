import { Injectable } from '@decorators/di';
import { attachControllers, Controller, Get, Post, Response } from '@decorators/express';
import * as express from 'express';
import { Response as Res } from 'express';

@Injectable()
@Controller('/')
class AppController {
  private passData = false;

  @Post('/login')
  public login(@Response() res: express.Response): void {
    res.send(this.generateTokens());
  }

  @Post('/refresh')
  public refresh(@Response() res: express.Response): void {
    // emulate long request
    setTimeout(() => res.send(this.generateTokens()), 1000);
  }

  @Get('/data')
  public getData(@Response() res: Res): void {
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
      setTimeout(() => res.status(401).send(), 300);
    }
  }

  private generateTokens() {
    return {
      accessToken: `access-token-${Math.random()}`,
      refreshToken: `access-token-${Math.random()}`,
    };
  }
}

const app = express();

app.use((
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  next();
});

attachControllers(app, [AppController]);

app.listen(3000);
