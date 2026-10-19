import express from 'express'

const app = express()

app.use(express.static(import.meta.dirname))

app.get('/clock', (req, res) => {
  res.send(new Date().toString())
})

app.listen(8000)