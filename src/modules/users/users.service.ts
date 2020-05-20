import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { User } from './user.entity';
import { genSalt, hash, compare } from 'bcrypt';
import { UserDto } from './dto/user.dto';
import { UserLoginRequestDto } from './dto/user-login-request.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginResponseDto } from './dto/user-login-response.dto';
import { JwtPayload } from './auth/jwt-payload.model';
import { sign } from 'jsonwebtoken';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '../shared/config/config.service';

@Injectable()
export class UsersService {
    private readonly jwtPrivateKey: string;

    constructor(
        @Inject('UsersRepository')
        private readonly usersRepository: typeof User,
        private readonly configService: ConfigService,
    ) {
        this.jwtPrivateKey = this.configService.jwtConfig.privateKey;
    }

    async findAll() {
        const users = await this.usersRepository.findAll<User>();
        return users.map(user => new UserDto(user));
    }

    async getUser(id: string) {
        const user = await this.usersRepository.findByPk<User>(id);
        if (!user) {
            throw new HttpException(
                'User with given id not found',
                HttpStatus.NOT_FOUND,
            );
        }
        return new UserDto(user);
    }

    async getUserByEmail(email: string) {
        return await this.usersRepository.findOne<User>({
            where: { email },
        });
    }

    async getUserByUsername(username: string) {
        return await this.usersRepository.findOne<User>({
            where: { username },
        });
    }

    async create(createUserDto: CreateUserDto) {
        try {
            const user = new User();
            user.email = createUserDto.email.trim().toLowerCase();
            user.username = createUserDto.username;
            user.gender = createUserDto.gender;
            user.birthday = createUserDto.birthday;

            const salt = await genSalt(10);
            user.password = await hash(createUserDto.password, salt);

            const userData = await user.save();

            // 注册时，然后通过返回令牌自动登录用户
            const token = await this.signToken(userData);
            return new UserLoginResponseDto(userData, token);
        } catch (err) {
            let errors = err.errors[0]
            if (errors.message === 'user.username must be unique') {
                throw new HttpException(
                    `用户名为 '${errors.value}' 已存在`,
                    HttpStatus.CONFLICT,
                );
            }else if (errors.message === 'user.email must be unique') {
                throw new HttpException(
                    `User with email '${errors.value}' already exists`,
                    HttpStatus.CONFLICT,
                );
            }

            throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async login(userLoginRequestDto: UserLoginRequestDto) {
        const username = userLoginRequestDto.username;
        const password = userLoginRequestDto.password;

        const user = await this.getUserByUsername(username);
        if (!user) {
            throw new HttpException(
                '用户不存在.',
                HttpStatus.BAD_REQUEST,
            );
        }

        const isMatch = await compare(password, user.password);
        if (!isMatch) {
            throw new HttpException(
                '用户名或密码错误.',
                HttpStatus.BAD_REQUEST,
            );
        }

        const token = await this.signToken(user);
        return new UserLoginResponseDto(user, token);
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.usersRepository.findByPk<User>(id);
        if (!user) {
            throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
        }

        user.username = updateUserDto.username || user.username;
        user.gender = updateUserDto.gender || user.gender;
        user.birthday = updateUserDto.birthday || user.birthday;

        try {
            const data = await user.save();
            return new UserDto(data);
        } catch (err) {
            throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(id: string) {
        const user = await this.usersRepository.findByPk<User>(id);
        await user.destroy();
        return new UserDto(user);
    }

    async signToken(user: User) {
        const payload: JwtPayload = {
            username: user.username,
        };

        return sign(payload, this.jwtPrivateKey, {});
    }
}
