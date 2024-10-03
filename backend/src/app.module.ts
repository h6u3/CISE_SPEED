import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ArticlesModule } from './articles/articles.module';

@Module({
  imports: [
    ConfigModule.forRoot(), MongooseModule.forRoot(process.env.DB_URI), 
    ArticlesModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
