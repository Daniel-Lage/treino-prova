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
