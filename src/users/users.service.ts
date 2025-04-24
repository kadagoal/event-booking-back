import { Injectable, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  SignUpCommand
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';
import { ConfirmUserDto } from './dto/confirm-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  private cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

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

  async confirmUser(confirmUserDto: ConfirmUserDto): Promise<any> {
    try {
      const secretHash = this.generateSecretHash(confirmUserDto.email);

      await this.cognitoClient.send(
        new ConfirmSignUpCommand({
          ClientId: process.env.COGNITO_CLIENT_ID,
          Username: confirmUserDto.email,
          ConfirmationCode: confirmUserDto.code,
          SecretHash: secretHash,
        })
      );

      return { message: 'Cuenta confirmada exitosamente.' };
    } catch (error) {
      if (error.name === 'CodeMismatchException') {
        throw new BadRequestException('El código de confirmación es incorrecto.');
      }
      if (error.name === 'ExpiredCodeException') {
        throw new BadRequestException('El código ha expirado. Solicita uno nuevo.');
      }
      if (error.name === 'UserNotFoundException') {
        throw new BadRequestException('Usuario no encontrado.');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new BadRequestException('El usuario ya ha sido confirmado.');
      }
      throw new InternalServerErrorException('Error al confirmar el usuario.');
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<any> {
    try {
      const secretHash = this.generateSecretHash(loginUserDto.email);
  
      const response = await this.cognitoClient.send(
        new InitiateAuthCommand({
          AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
          ClientId: process.env.COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: loginUserDto.email,
            PASSWORD: loginUserDto.password,
            SECRET_HASH: secretHash,
          },
        })
      );
  
      const user = await this.userModel.findOne({ email: loginUserDto.email });
  
      return {
        message: 'Inicio de sesión exitoso.',
        tokens: response.AuthenticationResult,
        role: user?.role,
      };
    } catch (error) {
      console.log(error);
      if (error.name === 'UserNotConfirmedException') {
        throw new BadRequestException('El usuario aún no ha confirmado su cuenta.');
      }
      if (error.name === 'NotAuthorizedException') {
        throw new BadRequestException('Correo o contraseña incorrectos.');
      }
      if (error.name === 'UserNotFoundException') {
        throw new BadRequestException('El usuario no existe.');
      }
      throw new InternalServerErrorException('Error al iniciar sesión.');
    }
  }  
}