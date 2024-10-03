import { Body, Controller, Get, Post } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './schemas/article.schema';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  getAllArticles(): Promise<Article[]> {
    return this.articlesService.getAllArticles();
  }

  @Post()
  async create(@Body() createArticleDto: any) {
    return this.articlesService.create(createArticleDto);
  }
}
