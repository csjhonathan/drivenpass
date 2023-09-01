import {
  ExecutionContext,
  NotFoundException,
  createParamDecorator,
} from '@nestjs/common';
import { Response } from 'express';

export const User = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const { locals } = context.switchToHttp().getResponse<Response>();

    if (!locals.user) {
      throw new NotFoundException('User not found!');
    }

    return locals.user;
  },
);
