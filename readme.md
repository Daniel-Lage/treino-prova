### Etapa 1

```ps
npm init -y

npm i @prisma/adapter-better-sqlite3@7 @prisma/client@7 dotenv ejs express

npm i -D nodemon prisma@7
```

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
+ "start": "nodemon watch src/server.js"
}
- "keywords": []
- "author": ""
- "license": "ISC"
- "type": "commonjs"
+ "type": "module"
```

### Etapa 2

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

### Etapa 3

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

### Etapa 4

ARQUIVO: prisma/schema.prisma

(adiciona o/s modelos necessarios dependendo do tema do crud, exemplo usando o aquecimento crud)

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
