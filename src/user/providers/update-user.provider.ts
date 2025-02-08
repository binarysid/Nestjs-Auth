import { Injectable, NotFoundException } from '@nestjs/common';
import { FindUserProvider } from './find-user.provider';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user.schema';
import { Model } from 'mongoose';
import { PatchUserDto } from '../dtos/patch-user.dto';

@Injectable()
export class UpdateUserProvider {
  constructor(
    @InjectModel(User.name)
    private readonly usersModel: Model<User>,
    private readonly findUserProvider: FindUserProvider,
  ) {}

  public async update(id: string, dto: PatchUserDto): Promise<User> {
    const existingUser = await this.findUserProvider.findUserbyId(id);
    if (existingUser) {
      // Filter out undefined fields before updating
      const updateData = Object.fromEntries(
        Object.entries(dto).filter(([_, value]) => value !== undefined),
      );

      return await this.usersModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
    } else {
      throw new NotFoundException('User not found');
    }
  }
}
