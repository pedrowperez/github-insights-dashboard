import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Informe um e-mail valido.' })
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
