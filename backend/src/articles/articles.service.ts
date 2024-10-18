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
  

  // // Fetch all articles (without pagination)
  // async getAllArticles(): Promise<Article[]> {
  //   return this.articleModel.find().exec();  // Fetch all articles from the database
  // }

  // Fetch articles pending moderation
  async getPendingArticles(): Promise<Article[]> {
    return this.articleModel.find({
      submitterVerified: true,
      moderatorApproved: false,
    }).exec();
  }

  // Create a new article (auto-reject if a duplicate DOI or title is found)
  // Create a new article (auto-reject if a duplicate DOI or title is found)
 // Create a new article (auto-reject if a duplicate DOI or title is found)
 async create(createArticleDto: any): Promise<Article> {
  const existingArticle = await this.articleModel.findOne({
    $or: [{ doi: createArticleDto.doi }, { title: createArticleDto.title }],
  });

  if (existingArticle) {
    if (existingArticle.status === 'rejected') {
      // Auto-reject with the same rejection reason if previously rejected
      return this.articleModel.create({
        ...createArticleDto,
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

  // Analyst can approve an article
  async approveArticleByAnalyst(id: string): Promise<Article> {
    const article = await this.articleModel.findByIdAndUpdate(
      id,
      { analystApproved: true, status: 'final-approved' },
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
          analystApproved: false,
        })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.articleModel.countDocuments({
        submitterVerified: false,
        moderatorApproved: false,
        analystApproved: false,
      }).exec(),
    ]);

    return { articles, totalCount };
  }



  // Search articles by criteria (title, author, doi, or status)
  // Search articles by criteria (title, author, doi, or status)
  async searchArticles(
    searchCriteria: { query?: string; startDate?: string; endDate?: string; claim?: string; evidence?: string },
    page: number,
    limit: number
  ): Promise<{ articles: Article[], totalCount: number }> {
    const skip = (page - 1) * limit;

    const queryFilter: any = {};
    if (searchCriteria.query) {
      queryFilter.$or = [
        { title: { $regex: searchCriteria.query, $options: 'i' } },
        { authors: { $regex: searchCriteria.query, $options: 'i' } },
        { claim: { $regex: searchCriteria.query, $options: 'i' } },
      ];
    }
    if (searchCriteria.startDate) {
      queryFilter.pubyear = { $gte: parseInt(searchCriteria.startDate) };
    }
    if (searchCriteria.endDate) {
      queryFilter.pubyear = { ...queryFilter.pubyear, $lte: parseInt(searchCriteria.endDate) };
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
}