import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NotFoundException,
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
      await this.userService.getUserByEmail(data.email);
      res.locals.user = user;

      return true;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException(error.response);
      }
      throw new UnauthorizedException();
    }
  }
}
