import { Module } from '@nestjs/common';
import { UsersModule } from '@app/modules/users/users.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { PostsModule } from '@app/modules/posts/posts.module';

@Module({
    imports: [UsersModule, PostsModule, SharedModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
