import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer,
} from '@loopback/authorization';
import {Provider} from '@loopback/core';

// export async function compareId(
//   authorizationCtx: AuthorizationContext,
//   metadata: AuthorizationMetadata,
// ) {
//   let currentUser: MyUserProfile;
//   if (authorizationCtx.principals.length > 0) {
//     const user = _.pick(authorizationCtx.principals[0], [
//       'id',
//       'email',
//       'role',
//     ]);
//     currentUser = {
//       [securityId]: user.id,
//       email: user.email,
//       id: user.id,
//       role: user.role,
//     };
//     // return AuthorizationDecision.ALLOW;
//   } else {
//     return AuthorizationDecision.DENY;
//   }
//   const userId = authorizationCtx.invocationContext.args[0];
//   return userId === currentUser[securityId]
//     ? AuthorizationDecision.ALLOW
//     : AuthorizationDecision.DENY;
// }

export class AuthorizationService implements Provider<Authorizer> {
  constructor() {}

  /**
   * @returns authenticateFn
   */
  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ) {
    const clientRole = authorizationCtx.principals[0].role;

    const allowedRoles = metadata.allowedRoles;
    // console.log(authorizationCtx);
    console.log(allowedRoles);
    if (allowedRoles) {
      return allowedRoles.includes(clientRole)
        ? AuthorizationDecision.ALLOW
        : AuthorizationDecision.DENY;
    }
    return AuthorizationDecision.DENY;
  }
}
