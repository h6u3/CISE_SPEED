import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ArticleDocument = Article & Document;

@Schema()
export class Article {
  @Prop()
  title: string;

  @Prop()
  authors: string;

  @Prop()
  source: string;

  @Prop()
  pubyear: number;

  @Prop()
  doi: string;

  @Prop()
  claim: string;

  @Prop()
  evidence: string;

  @Prop({ default: 'pending' })  // default status is pending
  status: string;

  @Prop()
  rejectionReason: string;  // if rejected, store reason
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
 