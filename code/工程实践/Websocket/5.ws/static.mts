import express from 'express'
const app = express()

app.use(express.static(import.meta.dirname))

app.listen(8000)