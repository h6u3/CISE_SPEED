import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(@InjectModel(Article.name) private articleModel: Model<ArticleDocument>) {}

  // Fetch all articles (including pending, approved, rejected)
  async getAllArticles(): Promise<Article[]> {
    this.logger.log('Fetching all articles');
    return this.articleModel.find().exec();
  }

  // Create a new article, default status is 'pending' unless duplicate
  async create(createArticleDto: any): Promise<Article> {
    const { title, doi } = createArticleDto;
  
    // Check for duplicates before creating a new article
    const isDuplicate = await this.checkDuplicateArticle(title, doi);
    if (isDuplicate) {
      this.logger.warn('Duplicate article found. Article will be automatically rejected.');
  
      // Auto-reject the article with a reason
      const rejectedArticle = new this.articleModel({
        ...createArticleDto,
        status: 'rejected',
        rejectionReason: 'Duplicate article found',
      });
  
      this.logger.log('Saving rejected article...');
      return rejectedArticle.save();  // Save as rejected
    }
  
    this.logger.log('Creating a new article with pending status');
    const createdArticle = new this.articleModel({ ...createArticleDto, status: 'pending' });
    return createdArticle.save();
  }
  

  // Fetch only articles that are pending moderation
  async getPendingArticles(): Promise<Article[]> {
    this.logger.log('Fetching articles with status: pending');
    return this.articleModel.find({ status: 'pending' }).exec();
  }

  // Approve an article, changing its status to 'approved'
  async approveArticle(id: string): Promise<Article> {
    // Find the article to approve
    const article = await this.articleModel.findById(id);
    if (!article) {
      this.logger.error(`Article with ID ${id} not found during approval`);
      throw new Error(`Article with ID ${id} not found`);
    }
  
    // Check if the article is a duplicate before approving
    const isDuplicate = await this.checkDuplicateArticle(article.title, article.doi);
    if (isDuplicate) {
      this.logger.warn(`Duplicate detected for article ID: ${id}. It will be rejected.`);
  
      // Auto-reject the article instead of approving it
      article.status = 'rejected';
      article.rejectionReason = 'Duplicate detected during approval process';
      return article.save();  // Save as rejected
    }
  
    // If not a duplicate, proceed to approve the article
    article.status = 'approved';
    this.logger.log(`Article with ID ${id} has been approved`);
    return article.save();  // Save as approved
  }
  

  // Reject an article with a reason, changing its status to 'rejected'
  async rejectArticle(id: string, reason: string): Promise<Article> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );

    if (!article) {
      this.logger.error(`Article with ID ${id} not found during rejection`);
      throw new Error(`Article with ID ${id} not found`);
    }

    this.logger.log(`Article with ID ${id} has been rejected for reason: ${reason}`);
    return article;
  }

  // Search articles by criteria (title, author, doi, or status)
  async searchArticles(query: any): Promise<Article[]> {
    const searchCriteria = {};

    // Add search criteria based on query parameters (e.g., title, author, etc.)
    if (query.title) {
      searchCriteria['title'] = { $regex: query.title, $options: 'i' };  // Case-insensitive
    }
    if (query.authors) {
      searchCriteria['authors'] = { $regex: query.authors, $options: 'i' };  // Case-insensitive
    }
    if (query.doi) {
      searchCriteria['doi'] = { $regex: query.doi, $options: 'i' };  // Case-insensitive
    }
    if (query.status) {
      searchCriteria['status'] = query.status;
    }

    this.logger.log(`Searching articles with criteria: ${JSON.stringify(searchCriteria)}`);
    return this.articleModel.find(searchCriteria).exec();
  }

  // Check for duplicate articles using either title or DOI
  async checkDuplicateArticle(title: string, doi: string): Promise<boolean> {
    this.logger.log(`Checking for duplicate article with title: "${title}" or DOI: "${doi}"`);
  
    // Normalize input: trim whitespace and convert to lowercase
    const normalizedTitle = title.trim().toLowerCase();
    const normalizedDoi = doi.trim().toLowerCase();
  
    // Find an article with a matching title or DOI
    const article = await this.articleModel.findOne({
      $or: [
        { title: normalizedTitle }, 
        { doi: normalizedDoi }
      ]
    });
  
    const isDuplicate = !!article;
  
    if (isDuplicate) {
      this.logger.warn(`Duplicate article found with title: "${title}" or DOI: "${doi}". Existing article: ${article}`);
    } else {
      this.logger.log(`No duplicate article found with title: "${title}" or DOI: "${doi}"`);
    }
  
    return isDuplicate;
  }
  
}
