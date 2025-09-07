import express from "express";
import { PrismaClient } from "./generated/prisma";
import { timeEnd } from "console";

const app = express();
const prisma = new PrismaClient();
const port = 3000;

app.use(express.json());

app.get("/movies", async (_, res) => {
  const movies = await prisma.movie.findMany({
    orderBy: {
      title: "asc",
    },
    include: {
      genres: true,
      languages: true,
    },
  });
  res.json(movies);
});

app.post("/movies", async (req, res) => {
  const { title, genre_id, language_id, oscar_count, release_date } = req.body;
  //verificar no banco se ja existe um filme com o nome sendo enviado
  const movieWithSameTitle = await prisma.movie.findFirst({
    where: { title: { equals: title, mode: "insensitive" } },
  });
  try {
    //case insensitive - ele vê maiscula e minuscula do mesmo jeito

    // case sensitive  - se buscar por john wick e no banco estiver como Jhon Wick não vai ser retornado na consulta
    if (movieWithSameTitle) {
      return res
        .status(409)
        .send({ Message: "ja existe esse filme com esse titulo" });
    } // 409 indica que a solicitação não pôde ser concluída devido a um conflito com o estado atual do recurso no servidor
    await prisma.movie.create({
      data: {
        title: title,
        genre_id: genre_id,
        language_id,
        release_date: new Date(release_date), // 0 representa janeiro, vai de 0 a 11
        oscar_count: oscar_count,
      },
    });
  } catch (error) {
    return res.status(500).send({ message: "Falha ao cadastrar um filme" });
  }
  res.status(201).send(); //201 é create, criou algo
});

app.listen(port, () => {
  console.log("🚀Server open in the port: " + port);
});
