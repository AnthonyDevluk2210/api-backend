import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module'; // <-- Importe o módulo aqui
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy'; // Não se esqueça de importar a estratégia

@Module({
  imports: [
    // ESTA LINHA É A SOLUÇÃO PARA O SEU ERRO ATUAL.
    // Ao importar o UsersModule, o AuthModule ganha acesso
    // a tudo que o UsersModule exportou (neste caso, o UsersService).
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'SEU_SEGREDO_SUPER_SECRETO', // Mude isso em produção!
      signOptions: { expiresIn: '1h' }, // O token expira em 1 hora
    }),
  ],
  controllers: [AuthController],
  // O AuthService precisa do UsersService e do JwtService
  // A JwtStrategy será usada pelo Passport para validar os tokens
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}