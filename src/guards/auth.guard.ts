import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const { authorization } = req.headers;
    if (!authorization) {
      throw new UnauthorizedException('Authorization must been provider!');
    }

    try {
      const token = authorization?.split(' ')[1];
      if (!token) throw new UnauthorizedException('Token must been provider!');

      const data = this.userService.checkToken(token);

      const user = await this.userService.findOneById(data.sub);

      res.locals.user = user;

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
