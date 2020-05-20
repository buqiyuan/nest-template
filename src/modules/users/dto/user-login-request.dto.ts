import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UserLoginRequestDto {
    @ApiProperty()
    readonly username: string;

    @ApiProperty()
    @IsString()
    readonly password: string;
}
