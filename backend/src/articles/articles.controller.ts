import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './schemas/article.schema';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  // Fetch all articles (for general purposes)
  @Get()
  getAllArticles(): Promise<Article[]> {
    return this.articlesService.getAllArticles();
  }

  // Create a new article (default status is 'pending')
  @Post()
  async create(@Body() createArticleDto: any) {
    return this.articlesService.create(createArticleDto);
  }


  // Fetch articles pending for moderation
  @Get('moderation')
  async getPendingArticles(): Promise<Article[]> {
    console.log('Fetching articles pending moderation...');
    return this.articlesService.getPendingArticles();  // Fetch articles with 'pending' status
  }
  


  @Post(':id/approve')
  async approveArticle(@Param('id') id: string): Promise<{ message: string; success: boolean }> {
    try {
      await this.articlesService.approveArticle(id);
      return { message: `Article with ID ${id} approved.`, success: true }; // Return success response
    } catch (error) {
      throw new Error(`Failed to approve article: ${error.message}`);
    }
  }
  
  @Post(':id/reject')
  async rejectArticle(@Param('id') id: string, @Body('reason') reason: string): Promise<{ message: string; success: boolean }> {
    try {
      await this.articlesService.rejectArticle(id, reason);
      return { message: `Article with ID ${id} rejected for reason: ${reason}.`, success: true }; // Return success response
    } catch (error) {
      throw new Error(`Failed to reject article: ${error.message}`);
    }
  }
  

  // Check if an article is a duplicate by comparing title or DOI
  @Post('check-duplicate')
  async checkDuplicate(@Body('title') title: string, @Body('doi') doi: string): Promise<boolean> {
    return this.articlesService.checkDuplicateArticle(title, doi);
  }
}
