import express from "express";
import { PrismaClient } from "./generated/prisma";

const app = express();
const prisma = new PrismaClient();
const port = 3000;

app.get("/movies", async (req, res) => {
  const movies = await prisma.movie.findMany();
  res.json(movies);
});

app.listen(port, () => {
  console.log("🚀Server open in the port: " + port);
});
