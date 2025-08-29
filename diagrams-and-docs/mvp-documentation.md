# Co-Learn - MVP Documentation

## Table of Contents
1. [Requirements Document](#requirements-document)
2. [System Architecture Diagrams](#system-architecture-diagrams)
3. [System Components](#system-components)
4. [System Requirements](#system-requirements)
5. [Sequence Diagrams](#sequence-diagrams)
6. [Data Flow Diagram](#data-flow-diagram)
7. [AI System Architecture](#ai-system-architecture)
8. [API Documentation](#api-documentation)
9. [Additional Diagrams](#additional-diagrams)

---

# Requirements Document

## 1. Project Overview

### 1.1 Purpose
The Egypt LMS Platform is a production-grade learning management system designed specifically for Egyptian high school students (Thanaweya Amma), combining Google Classroom functionality with advanced AI-powered grading and personalized feedback systems.

### 1.2 Scope
This MVP includes:
- Complete classroom management system
- AI-powered grading with personalized feedback
- Real-time communication features
- Comprehensive analytics dashboard

### 1.3 Stakeholders
- **Students**: High school students in Egypt
- **Teachers**: Educators managing courses and grading
- **Parents**: Monitoring student progress
- **Administrators**: System management and oversight

## 2. Functional Requirements

### 2.1 Authentication & Authorization
- **FR-AUTH-001**: System shall support user registration with email verification
- **FR-AUTH-002**: System shall implement JWT-based authentication
- **FR-AUTH-003**: System shall support role-based access control (Student, Teacher, Admin)
- **FR-AUTH-004**: System shall provide password reset functionality
- **FR-AUTH-005**: System shall support refresh token mechanism

### 2.2 Course Management
- **FR-COURSE-001**: Teachers shall create, update, and archive courses
- **FR-COURSE-002**: Students shall join courses via invitation code
- **FR-COURSE-003**: System shall display courses in card/list view
- **FR-COURSE-004**: System shall support course member management

### 2.3 Assignments & Submissions
- **FR-ASSIGN-001**: Teachers shall create assignments with due dates
- **FR-ASSIGN-002**: Students shall submit assignments (PDF/images)
- **FR-ASSIGN-003**: System shall support file attachments up to 50MB
- **FR-ASSIGN-004**: System shall track submission status

### 2.4 Materials & Resources
- **FR-MAT-001**: Teachers shall upload course materials
- **FR-MAT-002**: System shall organize materials in folders
- **FR-MAT-003**: System shall support various file formats
- **FR-MAT-004**: Materials shall be downloadable by enrolled students

### 2.5 Announcements
- **FR-ANN-001**: Teachers shall post announcements to courses
- **FR-ANN-002**: Students shall comment on announcements
- **FR-ANN-003**: System shall support rich text formatting
- **FR-ANN-004**: Announcements shall trigger notifications

### 2.6 AI Grading System
- **FR-AI-001**: System shall process PDF and image submissions
- **FR-AI-002**: AI shall grade assignments within 30 seconds
- **FR-AI-003**: System shall provide personalized feedback
- **FR-AI-004**: System shall identify common mistake patterns
- **FR-AI-005**: System shall generate actionable improvement suggestions

### 2.7 Notifications
- **FR-NOTIF-001**: System shall send email notifications
- **FR-NOTIF-002**: System shall provide in-app notifications
- **FR-NOTIF-003**: Users shall configure notification preferences
- **FR-NOTIF-004**: System shall support real-time notifications

### 2.8 Calendar Integration
- **FR-CAL-001**: System shall display assignment due dates
- **FR-CAL-002**: System shall integrate with Google Calendar
- **FR-CAL-003**: System shall provide month/week/day views
- **FR-CAL-004**: System shall export calendar events

### 2.9 Messaging
- **FR-MSG-001**: Users shall send direct messages
- **FR-MSG-002**: System shall support group chats for courses
- **FR-MSG-003**: Messages shall support file attachments
- **FR-MSG-004**: System shall show typing indicators

### 2.10 Analytics & Insights
- **FR-ANALYTICS-001**: System shall show class-wide performance metrics
- **FR-ANALYTICS-002**: System shall identify struggle patterns
- **FR-ANALYTICS-003**: Teachers shall view individual student progress
- **FR-ANALYTICS-004**: System shall generate exportable reports

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-PERF-001**: Page load time shall be < 2 seconds
- **NFR-PERF-002**: API response time shall be < 500ms
- **NFR-PERF-003**: AI grading shall complete within 30 seconds
- **NFR-PERF-004**: System shall support 10,000 concurrent users

### 3.2 Security
- **NFR-SEC-001**: All data transmission shall use HTTPS
- **NFR-SEC-002**: Passwords shall be bcrypt hashed
- **NFR-SEC-003**: System shall implement rate limiting
- **NFR-SEC-004**: File uploads shall be virus scanned

### 3.3 Usability
- **NFR-USE-001**: Interface shall be responsive (mobile-friendly)
- **NFR-USE-002**: System shall support Arabic and English
- **NFR-USE-003**: UI shall be accessible (WCAG 2.1 AA)
- **NFR-USE-004**: System shall provide contextual help

### 3.4 Reliability
- **NFR-REL-001**: System uptime shall be 99.9%
- **NFR-REL-002**: System shall auto-save user work
- **NFR-REL-003**: System shall handle failures gracefully
- **NFR-REL-004**: Data shall be backed up daily

### 3.5 Scalability
- **NFR-SCALE-001**: System shall scale horizontally
- **NFR-SCALE-002**: Database shall support sharding
- **NFR-SCALE-003**: Static assets shall use CDN
- **NFR-SCALE-004**: System shall use caching effectively

---

# System Architecture Diagrams

## Level 1: Simplified Architecture

```mermaid
graph TB
    subgraph "Users"
        Student[Students]
        Teacher[Teachers]
        Parent[Parents]
    end
    
    subgraph "System"
        Web[Web Application]
        API[API Server]
        AI[AI Services]
        DB[(Database)]
    end
    
    Student --> Web
    Teacher --> Web
    Parent --> Web
    Web --> API
    API --> AI
    API --> DB
    AI --> DB
```

## Level 2: Medium Detail Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "Presentation Layer"
        NextJS[Next.js Frontend<br/>React + TypeScript]
    end
    
    subgraph "API Layer"
        Gateway[API Gateway<br/>Nginx]
        NodeAPI[Node.js Backend<br/>NestJS]
        AIGateway[AI Gateway<br/>FastAPI]
    end
    
    subgraph "Service Layer"
        Auth[Auth Service]
        Course[Course Service]
        Grading[AI Grading]
        OCR[OCR Service]
        Notify[Notification Service]
    end
    
    subgraph "Data Layer"
        Postgres[(PostgreSQL<br/>Main Data)]
        MongoDB[(MongoDB<br/>Content)]
        Redis[(Redis<br/>Cache)]
        S3[Object Storage<br/>MinIO]
    end
    
    Browser --> NextJS
    Mobile --> NextJS
    NextJS --> Gateway
    Gateway --> NodeAPI
    Gateway --> AIGateway
    NodeAPI --> Auth
    NodeAPI --> Course
    NodeAPI --> Notify
    AIGateway --> Grading
    AIGateway --> OCR
    
    Auth --> Postgres
    Course --> Postgres
    Course --> MongoDB
    Grading --> Redis
    OCR --> S3
```

## Level 3: Detailed Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Web[Web Browser<br/>Chrome/Safari/Firefox]
        Mobile[Mobile Browser<br/>Responsive PWA]
        API_Client[API Clients<br/>Postman/Scripts]
    end
    
    subgraph "CDN & Static Assets"
        CloudFlare[CloudFlare CDN]
        Static[Static Files<br/>Images/CSS/JS]
    end
    
    subgraph "Load Balancer"
        Nginx[Nginx<br/>Reverse Proxy<br/>SSL Termination]
    end
    
    subgraph "Frontend Application"
        NextJS[Next.js 14<br/>App Router]
        React[React Components<br/>TypeScript]
        Zustand[State Management<br/>Zustand]
        TailwindCSS[Styling<br/>TailwindCSS]
        SocketClient[Socket.io Client<br/>Real-time]
    end
    
    subgraph "Backend Services"
        subgraph "Node.js Backend"
            NestJS[NestJS Framework]
            AuthModule[Auth Module<br/>JWT/Passport]
            CourseModule[Course Module]
            AssignModule[Assignment Module]
            NotifyModule[Notification Module]
            MessageModule[Messaging Module]
            CalendarModule[Calendar Module]
        end
        
        subgraph "Python AI Services"
            AIGateway[AI Gateway<br/>FastAPI]
            OCRService[OCR Service<br/>Tesseract/EasyOCR]
            GradingService[Grading Service<br/>OpenAI/Claude]
            FeedbackService[Feedback Service<br/>LangChain]
            InsightsService[Insights Service<br/>Analytics]
        end
    end
    
    subgraph "Message Queue"
        RabbitMQ[RabbitMQ]
        BullQueue[Bull Queue<br/>Redis-based]
    end
    
    subgraph "Databases"
        subgraph "Primary Storage"
            Postgres[(PostgreSQL<br/>Users/Courses/Grades)]
            MongoDB[(MongoDB<br/>Materials/Content)]
        end
        
        subgraph "Cache & Session"
            Redis[(Redis<br/>Cache/Sessions)]
        end
        
        subgraph "Object Storage"
            MinIO[MinIO/S3<br/>Files/Uploads]
        end
        
        subgraph "Vector Storage"
            ChromaDB[(ChromaDB<br/>Embeddings)]
        end
    end
    
    subgraph "External Services"
        Gmail[Gmail API<br/>Email]
        GoogleCal[Google Calendar API]
        OpenAI[OpenAI API<br/>GPT-4]
        Anthropic[Anthropic API<br/>Claude]
    end
    
    subgraph "Monitoring & Logging"
        Prometheus[Prometheus<br/>Metrics]
        Grafana[Grafana<br/>Dashboards]
        Sentry[Sentry<br/>Error Tracking]
        ELK[ELK Stack<br/>Logs]
    end
    
    Web --> CloudFlare
    Mobile --> CloudFlare
    CloudFlare --> Static
    CloudFlare --> Nginx
    API_Client --> Nginx
    
    Nginx --> NextJS
    Nginx --> NestJS
    Nginx --> AIGateway
    
    NextJS --> React
    React --> Zustand
    React --> TailwindCSS
    NextJS --> SocketClient
    
    NestJS --> AuthModule
    NestJS --> CourseModule
    NestJS --> AssignModule
    NestJS --> NotifyModule
    NestJS --> MessageModule
    NestJS --> CalendarModule
    
    AIGateway --> OCRService
    AIGateway --> GradingService
    AIGateway --> FeedbackService
    AIGateway --> InsightsService
    
    AuthModule --> Postgres
    CourseModule --> Postgres
    AssignModule --> MongoDB
    NotifyModule --> RabbitMQ
    MessageModule --> Redis
    
    OCRService --> MinIO
    GradingService --> ChromaDB
    FeedbackService --> OpenAI
    InsightsService --> Postgres
    
    NotifyModule --> Gmail
    CalendarModule --> GoogleCal
    GradingService --> Anthropic
    
    NestJS --> Prometheus
    AIGateway --> Prometheus
    Prometheus --> Grafana
    NestJS --> Sentry
    NestJS --> ELK
```

---

# System Components

```mermaid
graph TB
    subgraph "Frontend Components"
        UI[UI Components]
        UI --> Auth_UI[Authentication<br/>Login/Register]
        UI --> Dashboard_UI[Dashboard<br/>Course Cards]
        UI --> Course_UI[Course Management<br/>CRUD Operations]
        UI --> Assign_UI[Assignments<br/>Create/Submit]
        UI --> Grade_UI[Grading Display<br/>Feedback View]
        UI --> Notify_UI[Notifications<br/>Bell/Toasts]
        UI --> Calendar_UI[Calendar View<br/>FullCalendar]
        UI --> Message_UI[Messaging<br/>Chat Interface]
        UI --> Insights_UI[Analytics<br/>Charts/Graphs]
    end
    
    subgraph "Backend Components"
        API[API Layer]
        API --> Auth_API[Auth Controller<br/>JWT/Sessions]
        API --> Course_API[Course Controller<br/>CRUD/Enrollment]
        API --> Assign_API[Assignment Controller<br/>Submissions]
        API --> Storage_API[Storage Service<br/>File Upload]
        API --> Notify_API[Notification Service<br/>Email/Push]
        API --> Message_API[Message Gateway<br/>WebSocket]
        API --> Calendar_API[Calendar Service<br/>Events]
    end
    
    subgraph "AI Components"
        AI[AI Services]
        AI --> OCR[OCR Engine<br/>Text Extraction]
        AI --> Grader[Grading Engine<br/>Evaluation]
        AI --> Feedback[Feedback Generator<br/>Personalized]
        AI --> Analytics[Analytics Engine<br/>Insights]
        AI --> NLP[NLP Processor<br/>Language Understanding]
    end
    
    subgraph "Data Components"
        Data[Data Layer]
        Data --> UserDB[User Management<br/>PostgreSQL]
        Data --> CourseDB[Course Data<br/>PostgreSQL]
        Data --> ContentDB[Content Storage<br/>MongoDB]
        Data --> CacheDB[Cache Layer<br/>Redis]
        Data --> FileDB[File Storage<br/>MinIO]
    end
```

---

# System Requirements

```mermaid
graph LR
    subgraph "Functional Requirements"
        FR[Functional]
        FR --> Auth_Req[Authentication<br/>- Login/Register<br/>- JWT Tokens<br/>- Role-based]
        FR --> Course_Req[Courses<br/>- CRUD Operations<br/>- Enrollment<br/>- Archiving]
        FR --> Assign_Req[Assignments<br/>- Create/Submit<br/>- Due Dates<br/>- File Upload]
        FR --> AI_Req[AI Grading<br/>- OCR Processing<br/>- Auto-grading<br/>- Feedback]
        FR --> Comm_Req[Communication<br/>- Notifications<br/>- Messaging<br/>- Calendar]
    end
    
    subgraph "Non-Functional Requirements"
        NFR[Non-Functional]
        NFR --> Perf[Performance<br/>- Load < 2s<br/>- API < 500ms<br/>- Grade < 30s]
        NFR --> Scale[Scalability<br/>- 10K users<br/>- Horizontal scaling<br/>- Load balancing]
        NFR --> Secure[Security<br/>- HTTPS/SSL<br/>- JWT Auth<br/>- Rate limiting]
        NFR --> Reliable[Reliability<br/>- 99.9% uptime<br/>- Auto-save<br/>- Backup]
        NFR --> Usable[Usability<br/>- Responsive<br/>- Multi-language<br/>- Accessible]
    end
    
    subgraph "Technical Requirements"
        Tech[Technical]
        Tech --> Frontend_Tech[Frontend<br/>- Next.js 14<br/>- TypeScript<br/>- TailwindCSS]
        Tech --> Backend_Tech[Backend<br/>- NestJS<br/>- PostgreSQL<br/>- Redis]
        Tech --> AI_Tech[AI Stack<br/>- Python/FastAPI<br/>- OpenAI API<br/>- LangChain]
        Tech --> Infra_Tech[Infrastructure<br/>- Docker<br/>- Nginx<br/>- MinIO]
    end
```

---

# Sequence Diagrams

## Main System Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant W as Web App
    participant API as Backend API
    participant Auth as Auth Service
    participant Course as Course Service
    participant AI as AI Gateway
    participant OCR as OCR Service
    participant Grade as Grading Service
    participant DB as Database
    
    %% Authentication Flow
    S->>W: Access Platform
    W->>S: Show Login Page
    S->>W: Enter Credentials
    W->>API: POST /auth/login
    API->>Auth: Validate Credentials
    Auth->>DB: Check User
    DB-->>Auth: User Data
    Auth-->>API: Generate JWT
    API-->>W: Return Token
    W-->>S: Redirect to Dashboard
    
    %% Course Enrollment
    S->>W: Enter Course Code
    W->>API: POST /courses/enroll
    API->>Course: Validate Code
    Course->>DB: Check Course
    DB-->>Course: Course Data
    Course->>DB: Add Enrollment
    Course-->>API: Success
    API-->>W: Enrollment Confirmed
    W-->>S: Show Course
    
    %% Assignment Submission
    S->>W: Upload Assignment (PDF)
    W->>API: POST /assignments/submit
    API->>DB: Save Submission
    API->>AI: Process Submission
    
    %% AI Grading Flow
    AI->>OCR: Extract Text
    OCR-->>AI: Extracted Content
    AI->>Grade: Grade Assignment
    Grade-->>AI: Grading Result
    AI-->>API: Feedback & Score
    
    API->>DB: Save Results
    API-->>W: Submission Complete
    W-->>S: Show Feedback
    
    %% Real-time Notification
    API-->>W: WebSocket: New Grade
    W-->>S: Show Notification
```

## AI Grading Detailed Flow

```mermaid
sequenceDiagram
    participant T as Teacher
    participant S as Student
    participant W as Web App
    participant API as Backend
    participant Queue as Bull Queue
    participant AI as AI Gateway
    participant OCR as OCR Service
    participant LLM as OpenAI/Claude
    participant Cache as Redis
    participant DB as PostgreSQL
    
    %% Teacher Creates Assignment
    T->>W: Create Assignment
    W->>API: POST /assignments
    API->>DB: Save Assignment
    API-->>W: Assignment Created
    
    %% Student Submits
    S->>W: Upload PDF/Images
    W->>API: POST /submissions
    API->>DB: Create Submission Record
    API->>Queue: Add Grading Job
    API-->>W: Processing Started
    
    %% Async Processing
    Queue->>AI: Process Job
    
    AI->>Cache: Check if Cached
    alt Not Cached
        AI->>OCR: Extract Text
        OCR->>OCR: Preprocess Image
        OCR->>OCR: Run Tesseract
        OCR-->>AI: Extracted Text
        
        AI->>LLM: Send for Grading
        Note over LLM: Include: Text, Rubric,<br/>Answer Key, Student History
        LLM-->>AI: Grading Result
        
        AI->>LLM: Generate Feedback
        Note over LLM: Personalized based on<br/>mistakes and history
        LLM-->>AI: Feedback Text
        
        AI->>Cache: Store Result
    else Cached
        Cache-->>AI: Return Cached
    end
    
    AI-->>Queue: Job Complete
    Queue->>API: Update Status
    API->>DB: Save Results
    API->>W: WebSocket: Grade Ready
    W->>S: Show Notification
    
    %% Student Views Feedback
    S->>W: View Feedback
    W->>API: GET /submissions/{id}
    API->>DB: Get Results
    DB-->>API: Feedback Data
    API-->>W: Return Feedback
    W-->>S: Display Feedback
```

---

# Data Flow Diagram

```mermaid
graph TB
    subgraph "Data Input"
        UserInput[User Input<br/>Forms/Files]
        FileUpload[File Upload<br/>PDF/Images]
        APIRequest[API Requests]
        WebSocket[WebSocket<br/>Real-time]
    end
    
    subgraph "Processing Layer"
        Validation[Input Validation]
        Auth[Authentication]
        Transform[Data Transform]
        Queue[Job Queue]
    end
    
    subgraph "Business Logic"
        CourseLogic[Course Management]
        AssignLogic[Assignment Logic]
        GradeLogic[Grading Logic]
        NotifyLogic[Notification Logic]
    end
    
    subgraph "AI Processing"
        OCRProcess[OCR Processing]
        TextAnalysis[Text Analysis]
        Grading[AI Grading]
        FeedbackGen[Feedback Generation]
    end
    
    subgraph "Data Storage"
        TempStorage[Temp Storage<br/>Redis]
        FileStorage[File Storage<br/>MinIO]
        TransactionalDB[Transactional<br/>PostgreSQL]
        DocumentDB[Documents<br/>MongoDB]
        VectorDB[Vectors<br/>ChromaDB]
    end
    
    subgraph "Output"
        APIResponse[API Response]
        EmailNotif[Email]
        PushNotif[Push Notification]
        RealtimeUpdate[Real-time Update]
        Reports[Reports/Analytics]
    end
    
    UserInput --> Validation
    FileUpload --> Validation
    APIRequest --> Auth
    WebSocket --> Auth
    
    Validation --> Transform
    Auth --> Transform
    Transform --> CourseLogic
    Transform --> AssignLogic
    Transform --> Queue
    
    Queue --> OCRProcess
    OCRProcess --> TextAnalysis
    TextAnalysis --> Grading
    Grading --> FeedbackGen
    
    CourseLogic --> TransactionalDB
    AssignLogic --> DocumentDB
    GradeLogic --> TransactionalDB
    NotifyLogic --> TempStorage
    
    OCRProcess --> FileStorage
    FeedbackGen --> VectorDB
    
    TransactionalDB --> APIResponse
    DocumentDB --> Reports
    TempStorage --> RealtimeUpdate
    NotifyLogic --> EmailNotif
    NotifyLogic --> PushNotif
```

---

# AI System Architecture

```mermaid
graph TB
    subgraph "Input Layer"
        PDF[PDF Files]
        IMG[Images<br/>JPG/PNG]
        TEXT[Text Input]
        RUBRIC[Grading Rubric]
    end
    
    subgraph "OCR Service"
        PreProcess[Image Preprocessing<br/>Rotation/Enhancement]
        Tesseract[Tesseract OCR<br/>Multi-language]
        EasyOCR[EasyOCR<br/>Handwriting]
        PDFExtract[PDF Text Extraction<br/>PyPDF2]
        TextClean[Text Cleaning<br/>Arabic/English]
    end
    
    subgraph "AI Gateway"
        Router[Request Router]
        Validator[Input Validator]
        RateLimiter[Rate Limiter]
        CircuitBreaker[Circuit Breaker]
    end
    
    subgraph "Grading Engine"
        subgraph "Analysis"
            ContentAnalyzer[Content Analyzer]
            RubricMatcher[Rubric Matcher]
            AnswerComparer[Answer Comparison]
            MistakeDetector[Mistake Detection]
        end
        
        subgraph "LLM Processing"
            PromptBuilder[Prompt Builder]
            OpenAIAPI[OpenAI GPT-4]
            ClaudeAPI[Claude API]
            ResponseParser[Response Parser]
        end
        
        subgraph "Scoring"
            ScoreCalculator[Score Calculator]
            PartialCredit[Partial Credit]
            WeightedScoring[Weighted Scoring]
        end
    end
    
    subgraph "Feedback Generator"
        PersonalizedFeedback[Personalized Feedback]
        MistakeExplanation[Mistake Explanations]
        ImprovementTips[Improvement Tips]
        ResourceSuggestions[Resource Suggestions]
        ProgressTracking[Progress Tracking]
    end
    
    subgraph "Analytics Engine"
        PatternAnalyzer[Pattern Analyzer]
        ClassInsights[Class Insights]
        StruggleIdentifier[Struggle Areas]
        TrendAnalysis[Trend Analysis]
        ReportGenerator[Report Generator]
    end
    
    subgraph "Storage"
        ResultCache[Redis Cache<br/>Results]
        HistoryDB[PostgreSQL<br/>History]
        EmbeddingDB[ChromaDB<br/>Embeddings]
    end
    
    PDF --> PreProcess
    IMG --> PreProcess
    PreProcess --> Tesseract
    PreProcess --> EasyOCR
    PDF --> PDFExtract
    
    Tesseract --> TextClean
    EasyOCR --> TextClean
    PDFExtract --> TextClean
    
    TextClean --> Router
    TEXT --> Router
    RUBRIC --> Router
    
    Router --> Validator
    Validator --> RateLimiter
    RateLimiter --> CircuitBreaker
    
    CircuitBreaker --> ContentAnalyzer
    ContentAnalyzer --> RubricMatcher
    RubricMatcher --> AnswerComparer
    AnswerComparer --> MistakeDetector
    
    MistakeDetector --> PromptBuilder
    PromptBuilder --> OpenAIAPI
    PromptBuilder --> ClaudeAPI
    OpenAIAPI --> ResponseParser
    ClaudeAPI --> ResponseParser
    
    ResponseParser --> ScoreCalculator
    ScoreCalculator --> PartialCredit
    PartialCredit --> WeightedScoring
    
    WeightedScoring --> PersonalizedFeedback
    MistakeDetector --> MistakeExplanation
    PersonalizedFeedback --> ImprovementTips
    ImprovementTips --> ResourceSuggestions
    ResourceSuggestions --> ProgressTracking
    
    ProgressTracking --> PatternAnalyzer
    PatternAnalyzer --> ClassInsights
    ClassInsights --> StruggleIdentifier
    StruggleIdentifier --> TrendAnalysis
    TrendAnalysis --> ReportGenerator
    
    PersonalizedFeedback --> ResultCache
    ProgressTracking --> HistoryDB
    ContentAnalyzer --> EmbeddingDB
```

---

# API Documentation


## API Endpoints Detail

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/register` | Register new user | `{email, password, role, firstName, lastName}` | `{token, user}` |
| POST | `/api/auth/login` | User login | `{email, password}` | `{token, refreshToken, user}` |
| POST | `/api/auth/refresh` | Refresh token | `{refreshToken}` | `{token, refreshToken}` |
| POST | `/api/auth/logout` | Logout user | - | `{success}` |
| POST | `/api/auth/verify-email` | Verify email | `{token}` | `{success}` |
| POST | `/api/auth/reset-password` | Reset password | `{email}` or `{token, password}` | `{success}` |

### Course Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/courses` | List all courses | - | `{courses[]}` |
| GET | `/api/courses/{id}` | Get course details | - | `{course}` |
| POST | `/api/courses` | Create course | `{name, code, description}` | `{course}` |
| PUT | `/api/courses/{id}` | Update course | `{name, description}` | `{course}` |
| DELETE | `/api/courses/{id}` | Delete course | - | `{success}` |
| POST | `/api/courses/{id}/enroll` | Enroll in course | `{code}` | `{enrollment}` |
| GET | `/api/courses/{id}/members` | Get course members | - | `{members[]}` |

### Assignment Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/assignments` | List assignments | - | `{assignments[]}` |
| GET | `/api/assignments/{id}` | Get assignment | - | `{assignment}` |
| POST | `/api/assignments` | Create assignment | `{title, description, dueDate, courseId}` | `{assignment}` |
| PUT | `/api/assignments/{id}` | Update assignment | `{title, description, dueDate}` | `{assignment}` |
| POST | `/api/assignments/{id}/submit` | Submit assignment | `{files[], text}` | `{submission}` |
| GET | `/api/assignments/{id}/submissions` | Get submissions | - | `{submissions[]}` |

### AI Service Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/ai/grade` | Grade submission | `{submissionId, rubric}` | `{grade, feedback}` |
| POST | `/api/ai/ocr` | Extract text | `{file}` | `{text}` |
| GET | `/api/ai/feedback/{id}` | Get feedback | - | `{feedback, suggestions}` |
| GET | `/api/ai/insights/{courseId}` | Get class insights | - | `{patterns, struggles}` |

---

# Additional Diagrams

## Database Schema

```mermaid
erDiagram
    User ||--o{ CourseEnrollment : enrolls
    User ||--o{ Assignment : creates
    User ||--o{ Submission : submits
    User ||--o{ Notification : receives
    User ||--o{ Message : sends
    
    Course ||--o{ CourseEnrollment : has
    Course ||--o{ Assignment : contains
    Course ||--o{ Material : contains
    Course ||--o{ Announcement : has
    Course ||--o{ Folder : organizes
    
    Assignment ||--o{ Submission : receives
    Submission ||--|| Grade : has
    Grade ||--|| Feedback : generates
    
    Conversation ||--o{ Message : contains
    Conversation ||--o{ ConversationMember : has
    
    User {
        string id PK
        string email UK
        string password
        string role
        string firstName
        string lastName
        datetime createdAt
    }
    
    Course {
        string id PK
        string name
        string code UK
        string teacherId FK
        string description
        datetime createdAt
    }
    
    Assignment {
        string id PK
        string courseId FK
        string title
        string description
        datetime dueDate
        string rubric
    }
    
    Submission {
        string id PK
        string assignmentId FK
        string studentId FK
        string[] fileUrls
        string text
        datetime submittedAt
    }
    
    Grade {
        string id PK
        string submissionId FK
        float score
        json breakdown
        datetime gradedAt
    }
    
    Feedback {
        string id PK
        string gradeId FK
        text personalizedFeedback
        json mistakes
        json improvements
        json suggestions
    }
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "DMZ"
            CF[CloudFlare<br/>DDoS Protection]
            LB[Load Balancer<br/>Nginx]
        end
        
        subgraph "Application Tier"
            subgraph "Frontend Cluster"
                FE1[Frontend Pod 1]
                FE2[Frontend Pod 2]
                FE3[Frontend Pod 3]
            end
            
            subgraph "Backend Cluster"
                BE1[Backend Pod 1]
                BE2[Backend Pod 2]
                BE3[Backend Pod 3]
            end
            
            subgraph "AI Service Cluster"
                AI1[AI Service Pod 1]
                AI2[AI Service Pod 2]
            end
        end
        
        subgraph "Data Tier"
            subgraph "Database Cluster"
                PG_Primary[(PostgreSQL<br/>Primary)]
                PG_Replica[(PostgreSQL<br/>Replica)]
                Mongo_Primary[(MongoDB<br/>Primary)]
                Mongo_Secondary[(MongoDB<br/>Secondary)]
            end
            
            subgraph "Cache Cluster"
                Redis1[(Redis Master)]
                Redis2[(Redis Slave)]
            end
            
            subgraph "Storage"
                S3[S3/MinIO<br/>Object Storage]
            end
        end
        
        subgraph "Monitoring"
            Prom[Prometheus]
            Graf[Grafana]
            ELK[ELK Stack]
        end
    end
    
    CF --> LB
    LB --> FE1
    LB --> FE2
    LB --> FE3
    
    FE1 --> BE1
    FE2 --> BE2
    FE3 --> BE3
    
    BE1 --> AI1
    BE2 --> AI2
    
    BE1 --> PG_Primary
    BE2 --> PG_Replica
    BE3 --> Mongo_Primary
    
    AI1 --> Redis1
    AI2 --> Redis2
    
    BE1 --> S3
    AI1 --> S3
    
    BE1 --> Prom
    AI1 --> Prom
    Prom --> Graf
    BE1 --> ELK
```

## User Journey Map

```mermaid
graph LR
    subgraph "Student Journey"
        S_Start[Visit Platform] --> S_Reg[Register/Login]
        S_Reg --> S_Browse[Browse Courses]
        S_Browse --> S_Enroll[Enroll in Course]
        S_Enroll --> S_View[View Materials]
        S_View --> S_Assign[Check Assignments]
        S_Assign --> S_Work[Complete Work]
        S_Work --> S_Submit[Submit Assignment]
        S_Submit --> S_Wait[Wait for Grading]
        S_Wait --> S_Feedback[Receive Feedback]
        S_Feedback --> S_Improve[Study Feedback]
        S_Improve --> S_Progress[Track Progress]
    end
    
    subgraph "Teacher Journey"
        T_Start[Visit Platform] --> T_Login[Login]
        T_Login --> T_Create[Create Course]
        T_Create --> T_Invite[Invite Students]
        T_Invite --> T_Upload[Upload Materials]
        T_Upload --> T_Assign[Create Assignments]
        T_Assign --> T_Monitor[Monitor Submissions]
        T_Monitor --> T_Review[Review AI Grading]
        T_Review --> T_Insights[View Class Insights]
        T_Insights --> T_Intervene[Provide Support]
    end
    
    subgraph "AI Processing"
        AI_Receive[Receive Submission] --> AI_OCR[Extract Text]
        AI_OCR --> AI_Analyze[Analyze Content]
        AI_Analyze --> AI_Grade[Apply Rubric]
        AI_Grade --> AI_Feedback[Generate Feedback]
        AI_Feedback --> AI_Personalize[Personalize Response]
        AI_Personalize --> AI_Deliver[Deliver Results]
    end
    
    S_Submit -.-> AI_Receive
    AI_Deliver -.-> S_Feedback
    T_Monitor -.-> AI_Deliver
```

## State Diagram - Assignment Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Teacher Creates
    Draft --> Published: Publish
    Published --> Active: Due Date Approaching
    
    Active --> Submitted: Student Submits
    Submitted --> Processing: AI Grading Starts
    Processing --> Graded: Grading Complete
    
    Graded --> Reviewed: Teacher Reviews
    Reviewed --> Final: Approve Grade
    
    Active --> Late: Past Due Date
    Late --> Submitted: Late Submission
    
    Published --> Cancelled: Cancel Assignment
    Active --> Extended: Extend Deadline
    Extended --> Active: Continue
    
    Final --> [*]: Complete
    Cancelled --> [*]: End
    
    state Processing {
        [*] --> OCR: Extract Text
        OCR --> Grading: Process Content
        Grading --> Feedback: Generate Feedback
        Feedback --> Saving: Save Results
        Saving --> [*]
    }
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            FW[Firewall]
            WAF[Web Application Firewall]
            DDoS[DDoS Protection]
            SSL[SSL/TLS Encryption]
        end
        
        subgraph "Application Security"
            Auth[Authentication<br/>JWT]
            AuthZ[Authorization<br/>RBAC]
            Validation[Input Validation]
            Sanitization[Output Sanitization]
            RateLimit[Rate Limiting]
        end
        
        subgraph "Data Security"
            Encryption[Encryption at Rest]
            Transit[Encryption in Transit]
            Backup[Secure Backups]
            Audit[Audit Logs]
        end
        
        subgraph "Monitoring"
            IDS[Intrusion Detection]
            SIEM[SIEM System]
            Alerts[Security Alerts]
        end
    end
    
    Internet --> FW
    FW --> WAF
    WAF --> DDoS
    DDoS --> SSL
    
    SSL --> Auth
    Auth --> AuthZ
    AuthZ --> Validation
    Validation --> Sanitization
    
    Sanitization --> Encryption
    Encryption --> Transit
    Transit --> Backup
    Backup --> Audit
    
    Audit --> IDS
    IDS --> SIEM
    SIEM --> Alerts
```

---

## Summary

This comprehensive documentation provides:

1. **Complete Requirements**: Functional and non-functional requirements clearly defined
2. **Multi-level Architecture**: From simple to detailed views
3. **Component Breakdown**: Clear separation of concerns
4. **API Documentation**: Complete endpoint reference
5. **Data Flow**: How information moves through the system
6. **AI Architecture**: Detailed AI processing pipeline
7. **Security Considerations**: Multiple security layers
8. **User Journeys**: Clear paths for all user types
9. **Deployment Strategy**: Production-ready architecture

The system is designed to be:
- **Scalable**: Horizontal scaling at every layer
- **Maintainable**: Clear separation of concerns
- **Secure**: Multiple security layers
- **Performant**: Caching and optimization throughout
- **User-friendly**: Intuitive flows for all user types