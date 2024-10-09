// article.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticleDocument = Article & Document;

@Schema()
export class Article {
  @Prop({ required: true })
  title: string;

  @Prop()
  authors: string;

  @Prop()
  pubyear: number;

  @Prop({ required: false }) // Ensure this is part of the schema
  doi: string;

  @Prop({ default: 'pending' })
  status: string;

  // @Prop({ default: false })
  // submitterVerified: boolean;

  // @Prop({ default: false })
  // moderatorApproved: boolean;

  // @Prop({ default: false })
  // analystApproved: boolean;

  @Prop({ default: true })
  submitterVerified: boolean;

  @Prop()
  claim: string;

  @Prop({ default: true })
  moderatorApproved: boolean;

  @Prop({ default: true })
  analystApproved: boolean;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
