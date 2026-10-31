import { AppError } from "../utils/AppError.js";

export class CandiesService {
  constructor(candiesRepository) {
    this.candiesRepository = candiesRepository;
  }

  async create(payload) {
    payload.preco = Number(payload.preco);

    if (payload.preco <= 0) {
      throw new AppError("Preço deve ser maior que zero", 400);
    }

    const existingCandy = await this.candiesRepository.readByName(payload.nome);

    if (existingCandy) {
      throw new AppError("Doce já cadastrado", 409);
    }

    return await this.candiesRepository.create(payload);
  }

  async list() {
    return await this.candiesRepository.list();
  }

  async read(id) {
    const candy = await this.candiesRepository.read(id);

    if (!candy) {
      throw new AppError("Doce não foi encontrado", 404);
    }

    return candy;
  }

  async update(id, payload) {
    await this.read(id);

    payload.preco = Number(payload.preco);

    return await this.candiesRepository.update(id, payload);
  }

  async delete(id) {
    await this.read(id);
    return await this.candiesRepository.delete(id);
  }
}
