import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate } from 'uuid';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>
  ) { }

  async create(createProductDto: CreateProductDto) {

    try {
      const product = this.productRepository.create(createProductDto);

      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handlerExceptions(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {

    const { limit = 10, offset = 0 } = paginationDto;

    try {
      return await this.productRepository.find({
        take: limit,
        skip: offset,
      });
    } catch (error) {
      this.handlerExceptions(error);
    }
  }

  async findOne(term: string) {

    try {
      const product = await (
        validate(term)
          ? this.productRepository.findOneBy({ id: term })
          : this.productRepository.findOneBy({ slug: term })
      );

      if (!product) throw new NotFoundException();

      return product;
    } catch (error) {
      this.handlerExceptions(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.preload({
        id,
        ...updateProductDto,
      });

      if (!product) throw new NotFoundException(`Product with ${id} not found`);

      return await this.productRepository.save(product);
    } catch (error) {
      this.handlerExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      await this.productRepository.delete({ id });
    } catch (error) {
      this.handlerExceptions(error);
    }
  }

  handlerExceptions(error: any) {
    this.logger.error(error);
    if (error.code === '25505') throw new BadRequestException(error.details);
    if (error instanceof NotFoundException) throw error;
    throw new InternalServerErrorException('Unexpected error');
  }
}
