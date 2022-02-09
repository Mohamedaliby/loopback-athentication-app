// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/example-express-composition
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {once} from 'events';
import express, {Request, Response} from 'express';
import http from 'http';
import path from 'path';
import {ApplicationConfig, MyApplication} from './application';
export {ApplicationConfig};

export class ExpressServer {
  public readonly app: express.Application;
  public readonly lbApp: MyApplication;
  private server?: http.Server;

  constructor(options: ApplicationConfig = {}) {
    this.app = express();

    this.lbApp = new MyApplication(options);

    // Expose the front-end assets via Express, not as LB4 route
    this.app.use('/api', this.lbApp.requestHandler);

    // Custom Express routes
    this.app.get('/', function (_req: Request, res: Response) {
      res.sendFile(path.join(__dirname, '../public/express.html'));
    });
    this.app.get('/hello', function (_req: Request, res: Response) {
      res.send('Hello world!');
    });

    // Serve static files in the public folder
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  public async boot() {
    await this.lbApp.boot();
  }

  public async start() {
    await this.lbApp.start();
    // const port = +(process.env.PORT ?? 3000);
    // const host = process.env.HOST ?? '0.0.0.0';
    const port = this.lbApp.restServer.config.port ?? 3000;
    const host = this.lbApp.restServer.config.host || '0.0.0.0';
    this.server = this.app.listen(port, '0.0.0.0');
    await once(this.server, 'listening');
  }

  // For testing purposes
  public async stop() {
    if (!this.server) return;
    await this.lbApp.stop();
    this.server.close();
    await once(this.server, 'close');
    this.server = undefined;
  }
}
