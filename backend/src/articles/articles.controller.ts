import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './schemas/article.schema';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // Fetch and search articles with pagination
  @Get('search')
  async searchArticles(
    @Query('query') query: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('claim') claim: string,
    @Query('evidence') evidence: string, // Include evidence in the query
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ articles: Article[], totalCount: number }> {
    return this.articlesService.searchArticles({ query, startDate, endDate, claim, evidence }, page, limit);
  }

  // Fetch all articles with pagination
  @Get('all')
  async getAllArticles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ articles: Article[], totalCount: number }> {
    // Call the service method to fetch all articles with pagination
    return this.articlesService.getAllArticles(page, limit);
  }

  // Fetch all rejected articles with pagination
  @Get('rejected')
  async getRejectedArticles(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ articles: Article[], totalCount: number }> {
    return this.articlesService.getRejectedArticles(page, limit);
  }

  // Reject an article with a reason

@Post(':id/reject')
async rejectArticle(
  @Param('id') id: string,
  @Body('reason') reason: string
): Promise<Article> {
  return this.articlesService.rejectArticle(id, reason);
}


  @Post()
  async create(
    @Body() createArticleDto: { title: string; authors: string; doi: string; pubYear: number } // Use "pubyear" (lowercase "y")
  ): Promise<Article> {
    console.log('Received createArticleDto:', createArticleDto);
  
    // Call the service to handle the creation
    return this.articlesService.create(createArticleDto);
  }
  


  // Fetch articles pending for moderation
  @Get('moderation')
  async getPendingArticles(): Promise<Article[]> {
    return this.articlesService.getPendingArticles();
  }

  // Verify an article
  @Post(':id/verify')
  async verifyArticle(@Param('id') id: string): Promise<Article> {
    return this.articlesService.verifyArticle(id);
  }

  // Approve an article by a moderator
  @Post(':id/approve')
  async approveArticle(@Param('id') id: string): Promise<Article> {
    return this.articlesService.approveArticle(id);
  }


  @Get('unverified')
async getUnverifiedArticles(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10
): Promise<{ articles: Article[], totalCount: number }> {
  return this.articlesService.getUnverifiedArticles(page, limit);
}

@Get('verified')
async getVerifiedArticles(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10
): Promise<{ articles: Article[], totalCount: number }> {
  return this.articlesService.getVerifiedArticles(page, limit);
}


@Get('analyst-queue')
async getAnalystQueue(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10
): Promise<{ articles: Article[], totalCount: number }> {
  return this.articlesService.getAnalystQueue(page, limit);
}

@Post(':id/analyst-edit')
async updateAnalystEdit(
  @Param('id') id: string,
  @Body() updateDto: { claim: string; evidence: string }
): Promise<Article> {
  return this.articlesService.updateAnalystEdit(id, updateDto);
}

}
