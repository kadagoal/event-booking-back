import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(error => {
        const constraints = Object.values(error.constraints || {});
        return `${error.property}: ${constraints.map(m => traducirMensaje(m)).join(', ')}`;
      });
      return new BadRequestException(messages);
    },
  }));
  await app.listen(3000);
}
bootstrap();
function traducirMensaje(msg: string): string {
  // Cadenas
  if (msg.includes('must be a string')) return 'debe ser una cadena';
  if (msg.includes('must be longer than')) return 'debe tener más caracteres';
  if (msg.includes('must be shorter than')) return 'debe tener menos caracteres';
  if (msg.includes('must be one of the following values')) return 'debe ser uno de los valores permitidos';

  // Números
  if (msg.includes('must be a number')) return 'debe ser un número';
  if (msg.includes('must not be less than')) return 'no debe ser menor que el valor mínimo permitido';
  if (msg.includes('must not be greater than')) return 'no debe ser mayor que el valor máximo permitido';
  if (msg.includes('must be an integer number')) return 'debe ser un número entero';

  // Fechas
  if (msg.includes('must be a valid ISO 8601 date string')) return 'debe ser una fecha válida (ISO 8601)';
  if (msg.includes('must be a Date instance')) return 'debe ser un objeto de tipo fecha';

  // Booleanos
  if (msg.includes('must be a boolean value')) return 'debe ser verdadero o falso';

  // Correos, contraseñas y patrones
  if (msg.includes('must be an email')) return 'debe ser un correo válido';
  if (msg.includes('must match')) return 'no cumple con el formato requerido';
  if (msg.includes('must be a valid phone number')) return 'debe ser un número de teléfono válido';

  // Arrays
  if (msg.includes('must be an array')) return 'debe ser una lista';
  if (msg.includes('must contain at least')) return 'debe contener al menos cierta cantidad de elementos';
  if (msg.includes('must contain no more than')) return 'debe contener máximo cierta cantidad de elementos';

  // Objetos
  if (msg.includes('must be an object')) return 'debe ser un objeto';

  // Valores nulos o indefinidos
  if (msg.includes('should not be empty')) return 'no debe estar vacío';
  if (msg.includes('should not be null or undefined')) return 'no debe ser nulo ni indefinido';

  // Por defecto
  return msg;
}

