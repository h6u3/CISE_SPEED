import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './schemas/article.schema';

/*
so http://localhost:8082/articles/all is to show all
http://localhost:8082/articles/rejected is for rejected


*/

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // fetch fully verified article
  @Get()
  async getVerifiedArticles(): Promise<Article[]> {
    return this.articlesService.getVerifiedArticles();
  }


// Fetch all articles (general)
@Get('all')
async getAllArticles(): Promise<Article[]> {
  return this.articlesService.getAllArticles();
}

// New endpoint to fetch all rejected articles
@Get('rejected')
async getRejectedArticles(): Promise<Article[]> {
  return this.articlesService.getRejectedArticles();
}


  // Create a new article
  @Post()
  async create(@Body() createArticleDto: any) {
    return this.articlesService.create(createArticleDto);
  }

  // Fetch articles pending for moderation
  @Get('moderation')
  getPendingArticles(): Promise<Article[]> {
    return this.articlesService.getPendingArticles();
  }

  @Post(':id/verify')
  verifyArticle(@Param('id') id: string, @Body('verified') verified: boolean): Promise<Article> {
    return this.articlesService.verifyArticle(id, verified);
  }
  

  // Approve an article by a moderator
  @Post(':id/approve')
  approveArticle(@Param('id') id: string): Promise<Article> {
    return this.articlesService.approveArticle(id);
  }



  // Reject an article with a reason
  @Post(':id/reject')
  rejectArticle(@Param('id') id: string, @Body('reason') reason: string): Promise<Article> {
    return this.articlesService.rejectArticle(id, reason);
  }

  // Analyst approval endpoint
  @Post(':id/analyst-approve')
  approveArticleByAnalyst(@Param('id') id: string): Promise<Article> {
    return this.articlesService.approveArticleByAnalyst(id);
  }
}
