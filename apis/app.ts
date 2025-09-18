import express from 'express'
import bodyParser from 'body-parser'
import userRouterv1 from './routers/v1/user.routes.js'
import folderRouterv1 from './routers/v1/folder.routes.js'
import classroomRouterv1 from './routers/v1/classroom.routes.js'
import morgan from 'morgan'

const app = express()

app.use(morgan('dev'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// version 1 
app.use('/api/v1/users', userRouterv1)
app.use('/api/v1/folders', folderRouterv1)
app.use('/api/v1/classrooms', classroomRouterv1)

app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT || 3000}`)
})
