import { Sequelize } from 'sequelize-typescript';
import { User } from '@app/modules/users/user.entity';
import { Post } from '../modules/posts/post.entity';
import { ConfigService } from '../modules/shared/config/config.service';

export const databaseProviders = [
    {
        provide: 'SEQUELIZE',
        useFactory: async (configService: ConfigService) => {
            const sequelize = new Sequelize(configService.sequelizeOrmConfig);
            sequelize.addModels([User, Post]);
            await sequelize.sync({alter: true});
            return sequelize;
        },
        inject: [ConfigService],
    },
];
