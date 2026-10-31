-- CreateTable
CREATE TABLE "Candy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "preco" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Candy_nome_key" ON "Candy"("nome");
