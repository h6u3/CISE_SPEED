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

  // Create a new article (check for duplicate DOI or title)
  @Post()
  async create(@Body() createArticleDto: any) {
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

  // Analyst approval endpoint
  @Post(':id/analyst-approve')
  async approveArticleByAnalyst(@Param('id') id: string): Promise<Article> {
    return this.articlesService.approveArticleByAnalyst(id);
  }
}
