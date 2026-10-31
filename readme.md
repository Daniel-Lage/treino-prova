```
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
