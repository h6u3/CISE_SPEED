import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from './schemas/article.schema';

@Injectable()
export class ArticlesService {
  constructor(@InjectModel(Article.name) private articleModel: Model<ArticleDocument>) {}

  // Fetch all articles (could include pending, approved, rejected)
  async getAllArticles(): Promise<Article[]> {
    return this.articleModel.find().exec();
  }

  // Create a new article, default status is 'pending'
  async create(createArticleDto: any): Promise<Article> {
    const createdArticle = new this.articleModel({ ...createArticleDto, status: 'pending' });
    return createdArticle.save();
  }

  // Fetch only articles that are pending moderation
  async getPendingArticles(): Promise<Article[]> {
    return this.articleModel.find({ status: 'pending' }).exec();
  }

  // Approve an article, changing its status to 'approved'
  async approveArticle(id: string): Promise<Article> {
    return this.articleModel.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
  }

  // Reject an article with a reason, changing its status to 'rejected'
  async rejectArticle(id: string, reason: string): Promise<Article> {
    return this.articleModel.findByIdAndUpdate(
      id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );
  }

  // Check for duplicate articles using either title or DOI
  async checkDuplicateArticle(title: string, doi: string): Promise<boolean> {
    const article = await this.articleModel.findOne({ $or: [{ title }, { doi }] });
    return !!article; // Return true if a duplicate exists
  }
}
