import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';

import { initialData } from 'src/seed/data/seed';

@Injectable()
export class SeedService {

  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const firstUser = await this.insertUsers()
    await this.insertNewProducts(firstUser);
    return `Seed executed`;
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();

    await queryBuilder.delete().where({}).execute();

  }

  private async insertUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach(user => users.push(this.userRepository.create({
      ...user,
      password: bcrypt.hashSync(user.password, 10),
    })));

    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {

    const products = initialData.products;

    const insertPromises = products.map(product => this.productService.create(product, user));

    await Promise.all(insertPromises);

    return true;
  }

}
