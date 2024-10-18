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

  @Prop({ required: false })
  doi: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ default: false })
  submitterVerified: boolean;

  @Prop()
  claim: string;

  @Prop()
  evidence: string;

  @Prop({ default: false }) // Update moderatorApproved to default to false
  moderatorApproved: boolean;

  @Prop({ default: false }) // Update analystApproved to default to false
  analystApproved: boolean;

  @Prop()
  rejectionReason?: string; 
}

export const ArticleSchema = SchemaFactory.createForClass(Article);
