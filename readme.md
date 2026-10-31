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
