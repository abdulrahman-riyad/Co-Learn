CoLearn is a smart classroom platform, open-source for all the people around the world. Anyone can make account, either choose to be a student or a teacher or switching modes between them. he can enroll in all publicly available classrooms and organize them in folder based view for his preferences. All the assignments, the quizzes are AI graded according to the instructions of the professors. An AI feedback is sent to the student after finishing a course and final-examination is needed to make it more robust for handling.
# What makes CoLearn special than others
- It's an AI powered classroom
- Analytical dashboard for tutors to easily investigate the status of their course
- Completely secure for confidential materials that cannot be accessed directly from the user interface.
- AI supporting grading, assessment and feed-backing.
- Different modes and available resources for all the people to contribute, participate and enjoy learning new skills.
- (optionally) Making a complete social accounts for learners to share, explore and encourage each other for learning new skills.
- (optionally) Supporting AI suspicious activity detection for filtering harmful content and reporting spam users.

# Prerequisites before starting
- Studying more about software engineering design patterns -> purpose: to know more about best practices and good choices for making a robust system from the beginning
- Learn more about Agile principles and how it can be applied to effectively help planing and moving forward
- Finding good and committed partners who are willing to share and contribute to the project.
- Learning more about Front-End principles and best practices + finding a good front-end developer
- Learning more about distributed systems and data intensive application to help build more conscious about managing large data flows and communication
- ==To be continued==

## MVP
- Classroom Clone 
	- General dashboard of the classroom (including the general layout and the courses, controllers)
	- Authentication, Authorization layers
	- Folder view dashboard
	- Supporting main classroom features (assignments, Materials, Announcements)
	- Notifications (email notifications, app notifications)
	- Calendar view
	- Messaging views
- AI features
	- Auto-Feedback: Image and Text analyzing and grading (whether according to a model answer or according to the model knowledge), depending on OCR service
# Ideas
- Intensively valuable dashboard (classroom related, student related, self-assessment)
- Supporting Timed and Non-timed assignments and quizzes
- Security Measurements (2 sign in, material confidentiality, etc)
- Auto-Feedback (in quizzes, voice feedback to parents)
- Customized Video Player for security measures.
- OCR - RAG


# Initial docs
- Database Design
- Technical Stack
- Requirement document
- Activity Diagram, Sequence diagram

# Design Choices

## Database Management Systems

| `#`           | `MongoDB`                                                                                                                                                                                                                                                                                  | `PostgresSQL/MySQL`                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Advantages    | - Can easily handled structured and unstructured data<br>==- Flexible with changing requirements and schema designs==<br>- Provide an easy layout to deal with (document based structure)<br>- Support all normal indexing and concurrency utilities<br>- Can provide integrity assertions | - Solid database for relational data<br>- Familiarity<br>- Easy structure and handling<br>- Support efficient Indexing by nature, complex queries and joins |
| Disadvantages | - Less knowledge (new to use)<br>- Could result in unexpected results in case of inappropriate handling (Don't provide integrity assertions by nature)                                                                                                                                     | - Rigid and not flexible with frequent changing schema                                                                                                      |
At some point they are going to be used together for providing different purposes. 
## Backend Stack

- NodeJS (ExpressJS)
- ORM (Prisma, Sequelize)

# PreStart Stage (22 Aug - 30 Aug)

- [x] Make the repository for the project
- [ ] Backend Stack preperations
	- [ ] NodeJS / Express
		- [NodeJS Document](https://nodejs.org/en/learn/getting-started/how-much-javascript-do-you-need-to-know-to-use-nodejs)
	- [ ] MongoDB Study for NodeJS
		- [MongoDB University Course](https://learn.mongodb.com/learning-paths/mongodb-nodejs-developer-path)
		- [MongoDB Book](https://ftp.mclarkdev.com/uploads/library/Programming/The%20Definitive%20Guide/mongodbthedefinitiveguide.pdf)
		- [MongoDB Docs](https://www.mongodb.com/docs/drivers/node/current/)
		- [MongoDB Roadmap.sh](https://roadmap.sh/mongodb)
	- [ ] Prisma ORM
		- [Prisma with MongoDB](https://www.prisma.io/mongodb)
	
- [ ] CRUD operation and Postman Documentation for primary APIs
- [ ] Auto Feedback feature preparation
	- [ ] Models for doing OCR job
	- [ ] Machine Learning Prerequisites