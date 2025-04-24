import { Injectable, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import {
  CognitoIdentityProviderClient,
  SignUpCommand
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private cognitoClient = new CognitoIdentityProviderClient({ region: process.env.COGNITO_CLIENT_ID });

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private generateSecretHash(username: string): string {
    return crypto
      .createHmac('SHA256', process.env.COGNITO_CLIENT_SECRET as string)
      .update(username + process.env.COGNITO_CLIENT_ID)
      .digest('base64');
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      const secretHash = this.generateSecretHash(createUserDto.email);

      await this.cognitoClient.send(
        new SignUpCommand({
          ClientId: process.env.COGNITO_CLIENT_ID,
          Username: createUserDto.email,
          Password: createUserDto.password_hash,
          SecretHash: secretHash,
          UserAttributes: [
            { Name: 'name', Value: createUserDto.name },
            { Name: 'email', Value: createUserDto.email },
            ...(createUserDto.cellphone
              ? [{ Name: 'phone_number', Value: `+57${createUserDto.cellphone}` }]
              : []),
          ],
        })
      );

      const user = new this.userModel(createUserDto);
      await user.save();

      return {
        message: 'Usuario creado exitosamente. Revisa tu correo para confirmar tu cuenta.',
        data: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error.code === 11000 && error.keyPattern?.email) {
        throw new ConflictException('El correo electrónico ya está registrado.');
      }
      if (error.name === 'UsernameExistsException') {
        throw new ConflictException('Este usuario ya está registrado en Event booking.');
      }
      if (error.name === 'InvalidPasswordException') {
        throw new BadRequestException('La contraseña no cumple con la política de seguridad. Debe contener al menos una mayúscula, una minúscula, un número y un símbolo.');
      }
      if (error.name === 'InvalidParameterException') {
        throw new BadRequestException('Los datos proporcionados no son válidos. Verifica el formato de email, contraseña y otros atributos.');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new BadRequestException('No autorizado. Verifica el clientId y clientSecret configurados.');
      }
      throw new InternalServerErrorException('Ocurrió un error inesperado al registrar el usuario.');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }
}