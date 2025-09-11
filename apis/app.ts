import express from 'express'
import bodyParser from 'body-parser'
import userRouter from './routers/user.routes'
import morgan from 'morgan'

const app = express()

app.use(morgan('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api/users', userRouter)

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT || 3000}`)
})
