import { AppError } from "../utils/AppError.js";

export function validateCreateCandy(req, res, next) {
  const { nome, preco } = req.body;

  if (!nome) {
    throw new AppError("Campo 'nome' é obrigatório", 400);
  }

  if (!preco) {
    throw new AppError("Campo 'preco' é obrigatório", 400);
  }

  if (isNaN(Number(preco))) {
    throw new AppError("Campo 'preco' deve ser um número", 400);
  }

  next();
}
