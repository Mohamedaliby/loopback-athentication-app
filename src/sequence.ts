import {
  AuthenticateFn,
  AuthenticationBindings,
  AUTHENTICATION_STRATEGY_NOT_FOUND,
  USER_PROFILE_NOT_FOUND,
} from '@loopback/authentication';
import {inject} from '@loopback/context';
import {
  ExpressRequestHandler,
  FindRoute,
  InvokeMethod,
  InvokeMiddleware,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
// import helmet from 'helmet';
// import {apiLimiter} from './middleware';
import cors from 'cors';


const middlewareList: ExpressRequestHandler[] = [
  (req, res, next) => {
    next();
  },
   cors(),
  // helmet({}), // options for helmet is fixed and cannot be changed at runtime
  // apiLimiter,
];

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = () => false;
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const finished = await this.invokeMiddleware(context, middlewareList);
      if (finished) {
        // The http response has already been produced by one of the Express
        // middleware. We should not call further actions.
        return;
      }
      const route = this.findRoute(request);
      await this.authenticateRequest(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      if (
        err.code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
        err.code === USER_PROFILE_NOT_FOUND
      ) {
        Object.assign(err, {statusCode: 401 /* Unauthorized */});
      }
      this.reject(context, err);
    }
  }
}

// export class MySequence extends DefaultSequence {
//   @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
//   protected invokeMiddleware: InvokeMiddleware = () => false;
//   async handle(context: RequestContext): Promise<void> {
//     try {
//       const {request, response} = context;
//       // `this.invokeMiddleware` is an injected function to invoke a list of
//       // Express middleware handler functions
//       const finished = await this.invokeMiddleware(context, middlewareList);
//       if (finished) {
//         // The http response has already been produced by one of the Express
//         // middleware. We should not call further actions.
//         return;
//       }
//       const route = this.findRoute(request);
//       const args = await this.parseParams(request, route);
//       const result = await this.invoke(route, args);

//       this.send(response, result);
//     } catch (error) {
//       this.reject(context, error);
//     }
//   }
// }
