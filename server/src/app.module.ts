import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { DishesModule } from '@/dishes/dishes.module';
import { OrdersModule } from '@/orders/orders.module';
import { MessagesModule } from '@/messages/messages.module';
import { CartModule } from '@/cart/cart.module';
import { UploadModule } from '@/upload/upload.module';
import { BannersModule } from '@/banners/banners.module';
import { WishModule } from '@/wish/wish.module';

@Module({
  imports: [DishesModule, OrdersModule, MessagesModule, CartModule, UploadModule, BannersModule, WishModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
