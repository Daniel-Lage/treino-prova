### Inicialização e instalação de dependencias do sistema

```ps
npm init -y

npm i @prisma/adapter-better-sqlite3@7 @prisma/client@7 dotenv ejs express

npm i -D nodemon prisma@7
```

### Configuração inicial

ARQUIVO: .gitignore

```
node_modules/
package-lock.json
.env
*.db
```

ARQUIVO: package.json

```
- "description": ""
- "main": "index.js"
"scripts": {
- "test": "echo \"Error: no test specified\" && exit 1"
+ "start": "nodemon watch server.js"
}
- "keywords": []
- "author": ""
- "license": "ISC"
- "type": "commonjs"
+ "type": "module"
```

### Inicialização do prisma

```ps
npx prisma init --datasource-provider sqlite --output ../generated/prisma --no-skills
```

```
prisma7.config.js R
```

ARQUIVO: prisma/schema.prisma

```
- provider = "prisma-client"
+ provider = "prisma-client-js"
```

### Arquivos de tratamento de erro

ARQUIVO: middlewares/error.middleware.js

(não precisa ser exatamente assim, isso só faz o registro de erros)

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

ARQUIVO: utils/AppError.js

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

ARQUIVO: utils/asyncHandler.js

```js
export function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

### Criação do(s) modelo(s) prisma

(adiciona o/s modelos necessarios dependendo do tema do crud, exemplo usando o aquecimento crud)

ARQUIVO: prisma/schema.prisma

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

ARQUIVO: prisma/prisma.js

```js
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

### Criação do repository

(acesso ao banco atraves do cliente prisma)

ARQUIVO: repositories/candies.repository.js

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

(validação de regras de negócio)

ARQUIVO: services/candies.service.js

```js
import { AppError } from "../utils/AppError.js";

export class CandiesService {
  constructor(candyRepository) {
    this.candyRepository = candyRepository;
  }

  async create(payload) {
    payload.preco = Number(payload.preco);

    if (payload.preco <= 0) {
      throw new AppError("Preço deve ser maior que zero", 400);
    }

    const existingCandy = await this.candyRepository.readByName(payload.nome);

    if (existingCandy) {
      throw new AppError("Doce já cadastrado", 409);
    }

    return await this.candyRepository.create(payload);
  }

  async list() {
    return await this.candyRepository.list();
  }

  async read(id) {
    const candy = await this.candyRepository.read(id);

    if (!candy) {
      throw new AppError("Doce não foi encontrado", 404);
    }

    return candy;
  }

  async update(id, payload) {
    await this.read(id);

    payload.preco = Number(payload.preco);

    return await this.candyRepository.update(id, payload);
  }

  async delete(id) {
    await this.read(id);
    return await this.candyRepository.delete(id);
  }
}
```

### Criação do controller

(utilização do asyncHandler, tratamento de requisições e envio de respostas)

ARQUIVO: controllers/candies.controller.js

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
