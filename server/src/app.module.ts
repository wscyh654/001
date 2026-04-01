import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { DishesModule } from '@/dishes/dishes.module';
import { OrdersModule } from '@/orders/orders.module';
import { MessagesModule } from '@/messages/messages.module';
import { CartModule } from '@/cart/cart.module';
import { UploadModule } from '@/upload/upload.module';

@Module({
  imports: [DishesModule, OrdersModule, MessagesModule, CartModule, UploadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
