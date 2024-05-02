import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    this.enableUserHooks();
  }

  enableUserHooks() {
    this.$use(async (params, next) => {
      // console.log('params', params);
      return await next(params);
    });
  }
}
