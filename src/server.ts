import express from "express"

const app = express()
const port = 3000

app.get('/movies', (req, res) => {
  res.send("pagina movies")
})

app.listen(port, () => {
console.log("🚀Server open in the port: "+port )
})