import { User } from '../user.entity';
import { Gender } from '../../shared/enum/gender';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    readonly email: string;

    @ApiProperty()
    readonly username: string;

    @ApiProperty()
    readonly gender: Gender;

    @ApiProperty()
    readonly birthday: string;

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.username = user.username;
        this.gender = user.gender;
        this.birthday = user.birthday;
    }
}
