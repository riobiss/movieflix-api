import express from "express";
import { PrismaClient } from "./generated/prisma";
import swaggerUi from "swagger-ui-express"
import swaggerDocument from "../swagger.json"

const app = express();
const prisma = new PrismaClient();
const port = 3000;

app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

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
        .send({ Message: "ja existe um filme com esse titulo" });
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

app.put("/movies/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const movie = await prisma.movie.findUnique({
      where: {
        id: id,
      },
    });
    if (!movie) {
      return res.status(404).send({ Message: "Filme não encontrado" });
    }
    const data = { ...req.body }; //spread
    data.release_date = data.release_date
      ? new Date(data.release_date)
      : undefined;

    await prisma.movie.update({
      where: {
        id: id,
      },
      data: data,
    });
    res.status(200).send("deu certo");
    return res.status(500).send({ Message: "Não encontrado este filme" });
  } catch (error) {
    return res
      .status(500)
      .send({ Message: "Falha ao atualizar o registro do filme" });
  }
});

app.delete("/movies/:id", async (req, res) => {
  const id = Number(req.params.id);

  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) {
    return res.status(404).send({ Message: "NÃO DELETOUUUUUUUUUUUUUUUUUUUU" });
  }
  await prisma.movie.delete({ where: { id } });

  res.status(200).send(id + " REMOVEUUUUUUUUUUUUUUUUUUUUUUUUU");
});

app.get("/movies/:genreName", async (req, res) => {
  try {
    const moviesFilteredByGenreName = await prisma.movie.findMany({
      include: {
        genres: true,
        languages: true,
      },
      where: {
        genres: {
          name: {
            equals: req.params.genreName,
            mode: "insensitive",
          },
        },
      },
    });
    res.status(200).send(moviesFilteredByGenreName);
  } catch (error) {
    return res
      .status(500)
      .send({ Message: "Falha ao filtrar filmes por genero" });
  }
});

app.listen(port, () => {
  console.log("🚀Server open in the port: " + port);
});
