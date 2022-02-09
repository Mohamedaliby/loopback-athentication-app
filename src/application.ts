import {AuthenticationComponent} from '@loopback/authentication';
import {
  JWTAuthenticationComponent,
  TokenServiceBindings,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {
  AuthorizationComponent,
  AuthorizationDecision,
  AuthorizationOptions,
  AuthorizationTags,
} from '@loopback/authorization';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {DbDataSource} from './datasources';
import {MySequence} from './sequence';
import {JWTTokenService} from './services';
import {AuthService} from './services/authentication.service';
import {AuthorizationService} from './services/authorization.service';

export {ApplicationConfig};

export class MyApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
      // docExpansion: 'none',
      indexTemplatePath: path.resolve(__dirname, '../explorer/index.html.ejs'),
      // indexTemplatePath: path.resolve(__dirname, 'explorer.html.ejs'),
    });
    this.component(RestExplorerComponent);
    // Mount authentication system ///////
    this.component(AuthenticationComponent);
    // Mount jwt component
    this.component(JWTAuthenticationComponent);
    this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);
    this.bind(UserServiceBindings.USER_SERVICE.key).toClass(AuthService);
    this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTTokenService);
    // authorization
    const Authoptions: AuthorizationOptions = {
      precedence: AuthorizationDecision.DENY,
      defaultDecision: AuthorizationDecision.DENY,
    };

    const binding = this.component(AuthorizationComponent);
    this.configure(binding.key).to(Authoptions);

    this.bind('authorizationProviders.my-authorizer-provider')
      .toProvider(AuthorizationService)
      .tag(AuthorizationTags.AUTHORIZER);
    ////////////
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
