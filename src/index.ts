// import { MyApplication } from './application';
// import {ApplicationConfig} from './server';

// export {MyApplication};

// export async function main(options: ApplicationConfig = {}) {
//   const app = new MyApplication(options);
//   await app.boot();
//   await app.start();

//   const url = app.restServer.url;
//   console.log(`Server is running at ${url}`);
//   console.log(`Try ${url}/ping`);

//   return app;
// }
// import {MyApplication} from './application';
import {MyApplication} from './application';
import {ApplicationConfig, ExpressServer} from './server';

export {ApplicationConfig, ExpressServer};

export async function main(options: ApplicationConfig = {}) {
  // const server = new ExpressServer(options);
  const server = new MyApplication(options);
  await server.boot();
  await server.start();
  console.log('Server is running at http://127.0.0.1:3000');
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      rest: {
        cors: {
          origin: '*',
          // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
          // preflightContinue: false,
          // optionsSuccessStatus: 204,
          // maxAge: 86400,
          // credentials: true,
        },
      },
      port: +(process.env.PORT ?? 3000),
      host: process.env.HOST ?? '0.0.0.0',
      cors: {
        origin: '*',
        // methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        // preflightContinue: false,
        // optionsSuccessStatus: 204,
        // maxAge: 86400,
        // credentials: true,
      },
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
      // Use the LB4 application as a route. It should not be listening.
      // listenOnStart: false,
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
