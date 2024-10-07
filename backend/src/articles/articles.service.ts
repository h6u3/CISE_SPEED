import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);


  
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}


  // Fetch rejected articles
  async getRejectedArticles(): Promise<Article[]> {
    return this.articleModel.find({ status: 'rejected' }).exec();
  }

  // Fetch all articles (approved, pending, rejected)
  async getAllArticles(): Promise<Article[]> {
    return this.articleModel.find().exec(); // Fetch all articles from the database
  }


  
  // for searcher (only fetch verified)
async getVerifiedArticles(): Promise<Article[]> {
  return this.articleModel.find({
    submitterVerified: true,
    moderatorApproved: true,
    analystApproved: true,
  }).exec();
}

// async getVerifiedArticles(): Promise<Article[]> {
//   return this.articleModel.find().exec();  // Fetch all articles temporarily for testing
// }

  // Fetch articles that need moderator approval
  async getPendingArticles(): Promise<Article[]> {
    // Show articles where submitterVerified is true and moderator has not yet approved
    return this.articleModel.find({ submitterVerified: true, moderatorApproved: false }).exec();
  }

  // Create a new article
  async create(createArticleDto: any): Promise<Article> {

    console.log('Received article data in the backend:', createArticleDto);
    const newArticle = new this.articleModel({
      ...createArticleDto,
      // verified: false,  // Auto-flag as unverified
      // moderatorApproved: false,  // Default to moderator not approved
      // analystApproved: false,    // Default to analyst not approved
      // status: 'pending',         // Default status is pending
      pubyear: createArticleDto.pubYear,  // Map pubYear to pubyear (lowercase)
    });

    return newArticle.save();
  }
  

  // Update article verification status
  async verifyArticle(id: string, verified: boolean): Promise<Article> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      { verified },
      { new: true }
    );

    if (!article) {
      throw new BadRequestException('Article not found');
    }

    return article;
  }

  // Approve an article by the moderator
  async approveArticle(id: string): Promise<Article> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      { moderatorApproved: true, status: 'approved' },  // Mark as approved by moderator
      { new: true }  // Return the updated document
    );

    if (!article) {
      throw new BadRequestException('Article not found');
    }

    return article;
  }

  // Reject an article
  async rejectArticle(id: string, reason: string): Promise<Article> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      {
        status: 'rejected',  // Set status to rejected
        moderatorApproved: false,  // Ensure moderator approval is false
        rejectionReason: reason,   // Store the rejection reason
      },
      { new: true }  // Return the updated document
    );

    if (!article) {
      throw new BadRequestException('Article not found');
    }

    return article;
  }

  // Analyst can approve an article
  async approveArticleByAnalyst(id: string): Promise<Article> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      { analystApproved: true, status: 'final-approved' },  // Mark as approved by analyst
      { new: true }  // Return the updated document
    );

    if (!article) {
      throw new BadRequestException('Article not found');
    }

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

    // Log the search criteria
    this.logger.log(`Searching articles with criteria: ${JSON.stringify(searchCriteria)}`);

    // Execute the search
    const result = await this.articleModel.find(searchCriteria).exec();

    // Log the result
    this.logger.log(`Search result: ${JSON.stringify(result)}`);

    return result;
}


}
