import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { DishesModule } from '@/dishes/dishes.module';
import { OrdersModule } from '@/orders/orders.module';
import { MessagesModule } from '@/messages/messages.module';

@Module({
  imports: [DishesModule, OrdersModule, MessagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
