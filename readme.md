### Inicialização e instalação de dependencias do sistema

```ps
npm init -y

npm i @prisma/adapter-better-sqlite3@7 @prisma/client@7 dotenv ejs express

npm i -D nodemon prisma@7
```

### Configuração inicial

`.gitignore`

```
node_modules/
package-lock.json
.env
*.db
```

Adicionar comando para iniciar o servidor, e alterar o tipo dos arquivos js

`package.json`

```
"scripts": {
+ "start": "nodemon watch server.js"
}
- "type": "commonjs"
+ "type": "module"
```

### Inicialização do prisma

```ps
npx prisma init --datasource-provider sqlite --output ../generated/prisma --no-skills
```

Prisma utiliza typescript por padrão, temos que alterar manualmente para js

Renomeie `prisma7.config.ts` para `prisma7.config.js`

`prisma/schema.prisma`

```
- provider = "prisma-client"
+ provider = "prisma-client-js"
```

### Arquivos de tratamento de erro

Não precisa ser exatamente assim, isso só faz o registro de erros

`middlewares/error.middleware.js`

```js
import { AppError } from "../utils/AppError.js";

export function errorMiddleware(err, req, res, next) {
  if (err instanceof AppError) {
    console.error(
      `Error ${err.statusCode}: ${req.method}(${req.path}) -> "${err.message}"`,
    );

    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(`Error: ${req.method}(${req.path}) -> "${err.message}"`);

  res.status(500).json({ error: "Internal Server Error" });
}
```

`utils/AppError.js`

```js
export class AppError extends Error {
  statusCode;
  name;

  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
```

`utils/asyncHandler.js`

```js
export function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

### Criação dos modelos prisma

Adiciona os modelos necessarios dependendo do tema do crud, exemplo usando o aquecimento crud

`prisma/schema.prisma`

```
model Candy {
    id    Int    @id @default(autoincrement())
    nome  String @unique
    preco Int
}
```

```
npx prisma migrate dev --name init

npx prisma generate
```

`prisma/prisma.js`

```js
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

### Criação do repository

Acesso ao banco atraves do cliente prisma

`repositories/candies.repository.js`

```js
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
```

### Criação do service

Validação de regras de negócio

`services/candies.service.js`

```js
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
```

### Criação do controller

Utilização do asyncHandler, tratamento de requisições e envio de respostas

Arquivos em views/candies/ como list.ejs, details.ejs e form.ejs serão criados depois

`controllers/candies.controller.js`

```js
import { asyncHandler } from "../utils/asyncHandler.js";

export class CandiesController {
  constructor(candiesService) {
    this.candiesService = candiesService;
  }

  list = asyncHandler(async (req, res) => {
    const candies = await this.candiesService.list();

    res.render("candies/list", { candies });
  });

  details = asyncHandler(async (req, res) => {
    const candyId = Number(req.params.id);

    const candy = await this.candiesService.read(candyId);

    res.render("candies/details", { candy });
  });

  edit = asyncHandler(async (req, res) => {
    const candyId = Number(req.params.id);
    const payload = req.body;

    const updatedCandy = await this.candiesService.update(candyId, payload);

    res.redirect("/doces/" + updatedCandy.id);
  });

  delete = asyncHandler(async (req, res) => {
    const candyId = Number(req.params.id);

    await this.candiesService.delete(candyId);

    res.redirect("/doces");
  });

  create = asyncHandler(async (req, res) => {
    const payload = req.body;

    const newCandy = await this.candiesService.create(payload);

    res.redirect("/doces/" + newCandy.id);
  });

  form = asyncHandler(async (req, res) => {
    res.render("candies/form");
  });
}
```

### Criação das rotas

Validação de entrada, presença e tipo de campos para criação

`middlewares/validate.create.candy.middleware.js`

```js
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
```

Roteamento das funções do controller, injeção de dependencias e aplicação de middlewares

`routes/candies.routes.js`

```js
import { CandiesRepository } from "../repositories/candies.repository.js";
import { CandiesService } from "../services/candies.service.js";
import { CandiesController } from "../controllers/candies.controller.js";

import { Router } from "express";
import { validateCreateCandy } from "../middlewares/validate.create.candy.middleware.js";

const repository = new CandiesRepository();
const service = new CandiesService(repository);
const controller = new CandiesController(service);

const router = new Router();

router.post("/", validateCreateCandy, controller.create);
router.get("/", controller.list);
router.get("/novo", controller.form);
router.get("/:id", controller.details);
router.post("/:id", controller.edit);
router.post("/:id/excluir", controller.delete);

export default router;
```

### Criação do ponto de entrada

Configuração do ejs, definição de caminhos para views (arquivos .ejs) e estaticos (css ou icones svg), aplicação das rotas e middleware de erros, e execução do servidor na rota definida

`server.js`

```js
import express from "express";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import path from "node:path";
import candiesRouter from "./routes/candies.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.redirect("/doces"));

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.static(path.join(process.cwd(), "public")));

app.use("/doces", candiesRouter);

app.use(errorMiddleware);

app.use((req, res) => res.status(404).json({ erro: "recurso não encontrado" }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Delivery Tracker rodando em http://localhost:${PORT}`),
);
```
