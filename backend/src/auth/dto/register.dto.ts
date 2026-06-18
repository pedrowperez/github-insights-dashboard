import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Pedro Perez', minLength: 2, maxLength: 80 })
  @IsString()
  @MinLength(2, { message: 'O nome deve ter ao menos 2 caracteres.' })
  @MaxLength(80)
  name: string;

  @ApiProperty({ example: 'pedro@email.com' })
  @IsEmail({}, { message: 'Informe um e-mail valido.' })
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6, maxLength: 72 })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter ao menos 6 caracteres.' })
  @MaxLength(72)
  password: string;
}
