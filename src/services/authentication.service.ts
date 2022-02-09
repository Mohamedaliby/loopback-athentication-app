import {UserService} from '@loopback/authentication';
import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, SchemaObject} from '@loopback/rest';
import {securityId} from '@loopback/security';
import {compare} from 'bcryptjs';
import {User, UserRelations} from '../models';
import {UserRepository} from '../repositories';

// export interface MyUserProfile extends UserProfile {
//   role?: string;
// }
export type MyUserProfile = {
  id: number;
  email: string;
  role: string;
  [securityId]: string;
};

const CredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    phone: {
      type: 'number',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};

export declare type Credentials = {
  email?: string;
  password: string;
  phone?: number;
  userType?: string;
};

@bind({scope: BindingScope.TRANSIENT})
export class AuthService implements UserService<User, Credentials> {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) {}
  async verifyCredentials(credentials: Credentials): Promise<User> {
    console.log(credentials);

    const invalidCredentialsError = 'Invalid email or password.';
    const foundUser = await this.userRepository.findOne({
      where: {or: [{email: credentials.email}, {phone: credentials.phone}]},
    });

    console.log('foundUser', foundUser);
    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    } else {
      const credentialsFound = await this.userRepository.findCredentials(
        foundUser.id,
      );
      if (!credentialsFound) {
        throw new HttpErrors.Unauthorized(invalidCredentialsError);
      }
      const passwordMatched = await compare(
        credentials.password,
        credentialsFound.password,
      );
      if (!passwordMatched) {
        throw new HttpErrors.Unauthorized(invalidCredentialsError);
      }
      return foundUser;
    }
  }

  convertToUserProfile(user: User): MyUserProfile {
    return {
      [securityId]: `${user.id}`,
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async findUserById(id: number): Promise<User & UserRelations> {
    const sentUser = await this.userRepository.findById(id);
    return sentUser;
  }
}
