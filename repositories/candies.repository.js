import { prisma } from "../prisma/prisma.js";

export class CandiesRepository {
  async create(payload) {
    const candy = await prisma.candy.create({
      data: payload,
    });
    return candy;
  }

  async list() {
    const candies = await prisma.candy.findMany();
    return candies;
  }

  async read(id) {
    const candy = await prisma.candy.findUnique({
      where: { id },
    });
    return candy;
  }

  async readByName(nome) {
    const candy = await prisma.candy.findUnique({
      where: { nome },
    });
    return candy;
  }

  async update(id, payload) {
    const candy = await prisma.candy.update({
      where: { id },
      data: payload,
    });
    return candy;
  }

  async delete(id) {
    await prisma.candy.delete({
      where: { id },
    });
  }
}
