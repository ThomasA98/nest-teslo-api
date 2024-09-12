import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { ApiProperty } from "@nestjs/swagger";

import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";

@Entity()
export class Product {

  @ApiProperty({
    example: '0515ef3b-c515-44f5-9407-1ee8ef639e96',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Women s Turbine Cropped Short Sleeve Tee',
    description: 'Product Title',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product Price',
  })
  @Column('float', { default: 0 })
  price: number;

  @ApiProperty({
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    description: 'Product Description',
    default: null,
  })
  @Column({ type: 'text', nullable: true, })
  description: string;

  @ApiProperty({
    example: 'women_turbine_cropped_short_sleeve_tee',
    description: 'Product Slug - SEO routes',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product Stock',
    default: 0,
  })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({
    example: [ 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL' ],
    description: 'Product Sizes',
    default: [  ],
  })
  @Column('text', { array: true })
  sizes: string[];

  @ApiProperty({
    example: 'Women',
    description: 'Product Gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty({
    example: [ 'shirts', 'pants', 'hoodies', 'hats' ],
    description: 'Product Tags',
    default: [  ],
  })
  @Column('text', { array: true, default: [] })
  tags: string[];

  // @ApiProperty()
  @ManyToOne(
    () => User,
    (user) => user.product,
    { eager: true }
  )
  user: User;

  @ApiProperty()
  @OneToMany(
    () => ProductImage,
    productImage => productImage.product,
    { cascade: true, eager: true }
  )
  images?: ProductImage[];

  @BeforeInsert()
  checkSlugInsert() {
    this.slug = this.slug && this.slug !== ''
      ? this.slug
      : this.title;

    this.transformSlug();
  }

  @BeforeUpdate() checkSlugUpdate() { this.transformSlug() }

  private transformSlug() {
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '_')
      .replaceAll(',', '_');
  }

}
