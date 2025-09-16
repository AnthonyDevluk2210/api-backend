import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationResponseDto } from '../common/dto/pagination-response.dto';

interface FindAllOptions {
  page: number;
  limit: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  /**
   * Cria um novo produto e o associa a um usuário.
   */
  async create(createProductDto: CreateProductDto, userId: number): Promise<ProductEntity> {
    const newProduct = this.productRepository.create({
      ...createProductDto,
      user: { id: userId },
    });
    return await this.productRepository.save(newProduct);
  }

  /**
   * Busca e retorna uma lista paginada de produtos.
   * A opção `relations: ['user']` é crucial aqui para garantir que os dados do usuário
   * associado a cada produto sejam carregados e retornados na resposta da API.
   */
  async findAll(options: FindAllOptions): Promise<PaginationResponseDto<ProductEntity>> {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await this.productRepository.findAndCount({
      skip,
      take: limit,
      relations: ['user'], // <-- CORREÇÃO APLICADA AQUI
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Busca um único produto pelo seu ID.
   * A opção `relations: ['user']` também é essencial aqui para carregar
   * os dados do usuário dono do produto.
   */
  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['user'], // <-- CORREÇÃO APLICADA AQUI
    });

    if (!product) {
      throw new NotFoundException(`Produto com ID #${id} não encontrado.`);
    }
    return product;
  }

  /**
   * Atualiza os dados de um produto existente.
   */
  async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductEntity> {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });
    if (!product) {
      throw new NotFoundException(`Produto com ID #${id} não encontrado para atualizar.`);
    }
    return await this.productRepository.save(product);
  }

  /**
   * Remove um produto do banco de dados pelo seu ID.
   */
  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}