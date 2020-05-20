import { ApiProperty } from '@nestjs/swagger';
import { Post } from '../post.entity';

export class PostDto {
    @ApiProperty()
    readonly id: number;

    @ApiProperty()
    readonly authorId: string;

    @ApiProperty()
    readonly author: string;

    @ApiProperty()
    readonly title: string;

    @ApiProperty()
    readonly content: string;

    @ApiProperty()
    readonly createdAt: Date;

    @ApiProperty()
    readonly updatedAt: Date;

    constructor(post: Post) {
        this.id = post.id;
        this.authorId = post.userId;
        this.author = post.user.username;
        this.title = post.title;
        this.content = post.content;
        this.createdAt = post.createdAt;
        this.updatedAt = post.updatedAt;
    }
}
