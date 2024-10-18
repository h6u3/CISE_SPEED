import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(@InjectModel(Article.name) private articleModel: Model<ArticleDocument>) { }

  // Fetch all articles with pagination
  async getAllArticles(page: number, limit: number): Promise<{ articles: Article[], totalCount: number }> {
    const skip = (page - 1) * limit;
    const [articles, totalCount] = await Promise.all([
      this.articleModel.find().skip(skip).limit(limit).exec(),
      this.articleModel.countDocuments().exec(),
    ]);

    return { articles, totalCount };
  }


  // Fetch rejected articles with pagination
  async getRejectedArticles(page: number, limit: number): Promise<{ articles: Article[], totalCount: number }> {
    const skip = (page - 1) * limit;
    const [articles, totalCount] = await Promise.all([
      this.articleModel.find({ status: 'rejected' }).skip(skip).limit(limit).exec(),
      this.articleModel.countDocuments({ status: 'rejected' }).exec(),
    ]);
    return { articles, totalCount };
  }

  // Fetch verified articles with pagination
  async getVerifiedArticles(page: number, limit: number): Promise<{ articles: Article[], totalCount: number }> {
    const skip = (page - 1) * limit; // Calculate how many documents to skip based on the current page
  
    const [articles, totalCount] = await Promise.all([
      this.articleModel
        .find({
          submitterVerified: true,
          moderatorApproved: true,
        })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.articleModel.countDocuments({
        submitterVerified: true,
        moderatorApproved: true,
      }).exec(),
    ]);
  
    return { articles, totalCount }; // Return the articles and total count for pagination
  }
  


  // Fetch articles pending moderation
  async getPendingArticles(): Promise<Article[]> {
    return this.articleModel.find({
      submitterVerified: true,
      moderatorApproved: false,
    }).exec();
  }

 // Create a new article (auto-reject if a duplicate DOI or title is found)
 async create(createArticleDto: any): Promise<Article> {

  
  if (!createArticleDto.pubYear) {
    throw new BadRequestException('Publication year is required');
  }
  const existingArticle = await this.articleModel.findOne({
    $or: [{ doi: createArticleDto.doi }, { title: createArticleDto.title }],
  });




  if (existingArticle) {
    if (existingArticle.status === 'rejected') {
      // Auto-reject with the same rejection reason if previously rejected
      return this.articleModel.create({
        ...createArticleDto,
        pubYear: createArticleDto.pubYear,
        status: 'rejected',
        rejectionReason: `Duplicate submission detected (rejected previously): ${existingArticle.rejectionReason}`,
      });
    } else if (existingArticle.status === 'approved') {
      // Auto-reject if the article has been approved before
      return this.articleModel.create({
        ...createArticleDto,
        status: 'rejected',
        rejectionReason: 'Duplicate submission detected (already approved)',
      });
    }
  }

  // Create a new article if it's not a duplicate
  const newArticle = new this.articleModel({
    ...createArticleDto,
    pubYear: createArticleDto.pubYear,
    status: 'pending',
  });
  return newArticle.save();
}


  // Update article verification status
  async verifyArticle(id: string): Promise<Article> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      { moderatorApproved: true, status: 'approved' },
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
      { submitterVerified: true, moderatorApproved: true, status: 'approved' },
      { new: true }
    );
    if (!article) {
      this.logger.error(`Article with ID ${id} not found`);
      throw new BadRequestException('Article not found');
    }
    return article;
  }

  // Reject an article with a reason (manual rejection by moderator)
  async rejectArticle(id: string, reason: string): Promise<Article> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      { status: 'rejected', moderatorApproved: false, rejectionReason: reason },
      { new: true }
    );
    if (!article) {
      throw new BadRequestException('Article not found');
    }
    return article;
  }




  async getUnverifiedArticles(page: number, limit: number): Promise<{ articles: Article[], totalCount: number }> {
    const skip = (page - 1) * limit;

    const [articles, totalCount] = await Promise.all([
      this.articleModel
        .find({
          submitterVerified: false, // Unverified articles
          moderatorApproved: false,
   
        })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.articleModel.countDocuments({
        submitterVerified: false,
        moderatorApproved: false,
  
      }).exec(),
    ]);

    return { articles, totalCount };
  }

  // Search articles by criteria (title, author, doi, or status)
  async searchArticles(
    searchCriteria: { query?: string; startDate?: string; endDate?: string; claim?: string; evidence?: string },
    page: number,
    limit: number
  ): Promise<{ articles: Article[], totalCount: number }> {
    const skip = (page - 1) * limit;
  
    const queryFilter: any = {
      submitterVerified: true,   // Only articles verified by the submitter
      moderatorApproved: true,   // Only articles approved by the moderator
      claim: { $exists: true },  // Articles that have claim field (indicating it's been edited)
      evidence: { $exists: true }  // Articles that have evidence field
    };
  
    // Add optional filters if present in searchCriteria
    if (searchCriteria.query) {
      queryFilter.$or = [
        { title: { $regex: searchCriteria.query, $options: 'i' } },
        { authors: { $regex: searchCriteria.query, $options: 'i' } }
      ];
    }
    if (searchCriteria.startDate) {
      queryFilter.pubYear = { $gte: parseInt(searchCriteria.startDate) };
    }
    if (searchCriteria.endDate) {
      queryFilter.pubYear = { ...queryFilter.pubYear, $lte: parseInt(searchCriteria.endDate) };
    }
    if (searchCriteria.claim) {
      queryFilter.claim = { $regex: searchCriteria.claim, $options: 'i' };
    }
    if (searchCriteria.evidence) {
      queryFilter.evidence = { $regex: searchCriteria.evidence, $options: 'i' };
    }
  
    const [articles, totalCount] = await Promise.all([
      this.articleModel.find(queryFilter).skip(skip).limit(limit).exec(),
      this.articleModel.countDocuments(queryFilter).exec(),
    ]);
  
    return { articles, totalCount };
  }
  

  // Fetch articles for the analyst queue
  async getAnalystQueue(page: number, limit: number): Promise<{ articles: Article[], totalCount: number }> {
    const skip = (page - 1) * limit;
  
    const [articles, totalCount] = await Promise.all([
      this.articleModel
        .find({
          submitterVerified: true, // Only show articles with submitter verified
          moderatorApproved: true  // Include all moderator-approved articles
        })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.articleModel.countDocuments({
        submitterVerified: true,
        moderatorApproved: true
      }).exec(),
    ]);
  
    return { articles, totalCount };
  }
  


  async updateAnalystEdit(id: string, updateDto: { claim: string; evidence: string }): Promise<Article> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      { claim: updateDto.claim, evidence: updateDto.evidence }, // Update the fields
      { new: true } // Return the updated document
    );
    if (!article) {
      throw new BadRequestException('Article not found');
    }
    return article;
  }
  

}