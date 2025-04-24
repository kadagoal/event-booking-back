import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import * as jwt from 'jsonwebtoken';
  import { JwksClient } from 'jwks-rsa';
  
  const REGION = process.env.AWS_REGION || 'us-east-1';
  const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || 'us-east-1_o9IyXfQAq';
  const ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;
  
  const client = new JwksClient({
    jwksUri: `${ISSUER}/.well-known/jwks.json`,
  });
  
  function getKey(header, callback) {
    client.getSigningKey(header.kid)
      .then(key => {
        const signingKey = key && typeof key.getPublicKey === 'function' ? key.getPublicKey() : null;
        if (!signingKey) return callback(new Error('No se pudo obtener la clave pública'));
        callback(null, signingKey);
      })
      .catch(err => callback(err));
  }
  
  @Injectable()
  export class CognitoAuthGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers['authorization'];
  
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Token no proporcionado');
      }
  
      const token = authHeader.split(' ')[1];
  
      try {
        const decoded = await new Promise<any>((resolve, reject) => {
          jwt.verify(
            token,
            getKey,
            {
              issuer: ISSUER,
              algorithms: ['RS256'],
            },
            (err, decoded) => {
              if (err) reject(err);
              else resolve(decoded);
            },
          );
        });
  
        request.user = decoded;
  
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
          context.getHandler(),
          context.getClass(),
        ]);
  
        if (requiredRoles && !requiredRoles.includes(decoded['custom:role'])) {
          throw new UnauthorizedException('No tienes permisos para esta acción.');
        }
  
        return true;
      } catch (err) {
        throw new UnauthorizedException('Token inválido o expirado.');
      }
    }
  }