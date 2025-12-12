import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';
import { AssistantModule } from './assistant/assistant.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://tektov2004_db_user:EK8cpgY4srOdktQs@cluster0.0xubshr.mongodb.net/?appName=Cluster0'),
    UserModule, OrderModule, ProductModule, ReviewModule, AssistantModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
