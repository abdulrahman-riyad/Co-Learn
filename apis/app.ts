import express from 'express'
import bodyParser from 'body-parser'
import folderRouterv1 from './routers/v1/folder.routes.js'
import classroomRouterv1 from './routers/v1/classroom.routes.js'
import userRouterv1 from './routers/v1/user.routes.ts'
import authRouterv1 from './routers/v1/auth.routes.ts'
import morgan from 'morgan'
import cookieParser from "cookie-parser"

const app = express()

app.use(morgan('dev'))
app.use(cookieParser())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// version 1 
app.use('/api/v1/users', userRouterv1)
app.use('/api/v1/folders', folderRouterv1)
app.use('/api/v1/classrooms', classroomRouterv1)
app.use('/api/v1/auth', authRouterv1)
app.use('/', (req, res) => {
  res.send('Welcome to Co-Learn API')
})
/* TODO: folder routes */

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT || 3000}`)
})
