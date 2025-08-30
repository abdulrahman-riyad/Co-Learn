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
Co-Learn is a production-grade learning management system designed specifically for Egyptian high school students (Thanaweya Amma), combining Google Classroom functionality with advanced AI-powered grading and personalized feedback systems.

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

## Simplified Architecture

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

## More Detailed System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
    end
    
    subgraph "CDN"
        CloudFlare[CloudFlare CDN<br/>Static Assets]
    end
    
    subgraph "Frontend"
        NextJS[Next.js 14<br/>• App Router<br/>• Server Components]
        UI[UI Layer<br/>• TailwindCSS<br/>• Shadcn/ui]
    end
    
    subgraph "Backend Services"
        Gateway[API Gateway<br/>Nginx]
        NodeAPI[Node.js Backend<br/>• NestJS<br/>• REST APIs]
        AIGateway[AI Gateway<br/>• FastAPI<br/>• Async processing]
    end
    
    subgraph "Microservices"
        AuthService[Auth Service<br/>JWT/Passport]
        CourseService[Course Service<br/>CRUD ops]
        NotifyService[Notification<br/>Email/Push]
        OCRService[OCR Service<br/>Multi-engine]
        GradeService[Grading Service<br/>LLM-based]
    end
    
    subgraph "Databases"
        Postgres[(PostgreSQL<br/>Users, Courses)]
        MongoDB[(MongoDB<br/>Materials)]
        Redis[(Redis<br/>Cache, Queue)]
        MinIO[MinIO<br/>File Storage]
    end
    
    Browser --> CloudFlare
    CloudFlare --> NextJS
    NextJS --> UI
    NextJS --> Gateway
    
    Gateway --> NodeAPI
    Gateway --> AIGateway
    
    NodeAPI --> AuthService
    NodeAPI --> CourseService
    NodeAPI --> NotifyService
    
    AIGateway --> OCRService
    AIGateway --> GradeService
    
    AuthService --> Postgres
    CourseService --> Postgres
    CourseService --> MongoDB
    NotifyService --> Redis
    OCRService --> MinIO
    GradeService --> Redis
```


---

# System Components

```mermaid
graph TB
    subgraph "Frontend Components"
        UI[UI Layer]
        UI --> Pages[Pages<br/>• Dashboard<br/>• Courses<br/>• Assignments]
        UI --> Components[Components<br/>• Forms<br/>• Cards<br/>• Tables]
        UI --> Features[Features<br/>• Auth flow<br/>• File upload<br/>• Real-time]
    end
    
    subgraph "Backend Services"
        API[API Layer]
        API --> Controllers[Controllers<br/>• REST endpoints<br/>• Validation]
        API --> Services[Services<br/>• Business logic<br/>• Data processing]
        API --> Integration[Integrations<br/>• AI Gateway<br/>• External APIs]
    end
    
    subgraph "AI Pipeline"
        AI[AI Services]
        AI --> OCR[OCR<br/>• Text extraction<br/>• Multi-language]
        AI --> Grading[Grading<br/>• Rubric eval<br/>• Score calc]
        AI --> Analytics[Analytics<br/>• Insights<br/>• Patterns]
    end
    
    subgraph "Data Management"
        Data[Data Layer]
        Data --> Relational[PostgreSQL<br/>• Users<br/>• Courses<br/>• Grades]
        Data --> NoSQL[MongoDB<br/>• Content<br/>• Materials]
        Data --> Cache[Redis<br/>• Sessions<br/>• Queue]
    end
```

---

# System Requirements

```mermaid
graph LR
    subgraph "Core Features"
        Features[Functional]
        Features --> UserMgmt[User Management<br/>• Registration<br/>• Authentication<br/>• Roles]
        Features --> CourseMgmt[Course System<br/>• Create/Join<br/>• Materials<br/>• Assignments]
        Features --> AIGrading[AI Grading<br/>• OCR<br/>• Auto-grade<br/>• Feedback]
        Features --> Comm[Communication<br/>• Notifications<br/>• Messages<br/>• Calendar]
    end
    
    subgraph "Quality Attributes"
        Quality[Non-Functional]
        Quality --> Performance[Performance<br/>• Response time<br/>• Throughput<br/>• Optimization]
        Quality --> Reliability[Reliability<br/>• 99.9% uptime<br/>• Error handling<br/>• Recovery]
        Quality --> Security[Security<br/>• Encryption<br/>• Auth<br/>• Validation]
        Quality --> UX[User Experience<br/>• Responsive<br/>• Intuitive<br/>• Accessible]
    end
```

---

# Sequence Diagram

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
    
    S->>W: Access Platform
    W->>API: Request Login Page
    S->>W: Submit Credentials
    W->>API: POST /auth/login
    API->>Auth: Validate
    Auth->>DB: Check User
    DB-->>Auth: User Data
    Auth-->>API: JWT Token
    API-->>W: Auth Success
    W-->>S: Dashboard
    
    S->>W: View Courses
    W->>API: GET /courses
    API->>Course: Fetch Courses
    Course->>DB: Query
    DB-->>Course: Course List
    Course-->>API: Courses
    API-->>W: Course Data
    W-->>S: Display Courses
    
    S->>W: Submit Assignment (PDF)
    W->>API: POST /submit
    API->>DB: Save Submission
    API->>AI: Process File
    AI->>OCR: Extract Text
    OCR-->>AI: Text Content
    AI->>Grade: Grade Assignment
    Grade-->>AI: Results
    AI-->>API: Feedback
    API->>DB: Save Grade
    API-->>W: Complete
    W-->>S: Show Feedback
```

## AI Grading Detailed Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant B as Backend
    participant Q as Queue
    participant AI as AI Gateway
    participant OCR as OCR Engine
    participant LLM as LLM Service
    participant Cache as Redis Cache
    participant DB as Database
    
    S->>B: Upload Assignment
    B->>DB: Create Submission
    B->>Q: Add Job
    B-->>S: Processing...
    
    Q->>AI: Process Job
    AI->>Cache: Check Cache
    
    alt Not Cached
        AI->>OCR: Extract Text
        Note over OCR: Multi-engine:<br/>Tesseract, Paddle,<br/>TrOCR
        OCR-->>AI: Extracted Text
        
        AI->>LLM: Grade
        Note over LLM: Context:<br/>Text, Rubric,<br/>Answer Key
        LLM-->>AI: Grade Result
        
        AI->>Cache: Store Result
    else Cached
        Cache-->>AI: Return Cached
    end
    
    AI-->>Q: Complete
    Q->>B: Update Status
    B->>DB: Save Results
    B->>S: Notify: Grade Ready
    
    S->>B: View Feedback
    B->>DB: Get Results
    DB-->>B: Feedback
    B-->>S: Display
```

---

# Data Flow Diagram

```mermaid
graph TB
    subgraph "Input Sources"
        UserInput[User Input<br/>• Forms<br/>• Files]
        FileUpload[File Upload<br/>• PDF<br/>• Images]
        APIRequests[API Requests<br/>• REST<br/>• WebSocket]
    end
    
    subgraph "Processing Pipeline"
        Validation[Input Validation<br/>• Schema check<br/>• Sanitization]
        Auth[Authentication<br/>• JWT verify<br/>• Role check]
        BusinessLogic[Business Logic<br/>• Course ops<br/>• Assignment ops]
        AIProcessing[AI Processing<br/>• OCR<br/>• Grading]
    end
    
    subgraph "Storage Layer"
        Primary[(PostgreSQL<br/>Transactional)]
        Document[(MongoDB<br/>Content)]
        Cache[(Redis<br/>Temporary)]
        Files[MinIO<br/>Objects]
    end
    
    subgraph "Output Channels"
        APIResponse[API Response<br/>• JSON<br/>• Status codes]
        Notifications[Notifications<br/>• Email<br/>• Push<br/>• In-app]
        Analytics[Analytics<br/>• Reports<br/>• Dashboards]
    end
    
    UserInput --> Validation
    FileUpload --> Validation
    APIRequests --> Auth
    
    Validation --> Auth
    Auth --> BusinessLogic
    BusinessLogic --> AIProcessing
    
    BusinessLogic --> Primary
    AIProcessing --> Document
    AIProcessing --> Cache
    FileUpload --> Files
    
    Primary --> APIResponse
    Document --> Analytics
    Cache --> Notifications
```

---

# AI System Architecture

```mermaid
graph TB
    subgraph "Document Input"
        PDF[PDF Files]
        Images[Images<br/>JPG/PNG]
        Handwritten[Handwritten<br/>Scans]
    end
    
    subgraph "OCR Pipeline"
        Preprocessor[Preprocessor<br/>• Enhance<br/>• Rotate<br/>• Denoise]
        OCRRouter[OCR Router<br/>• Document type<br/>• Quality check]
        
        subgraph "OCR Engines"
            Tesseract[Tesseract<br/>Printed text]
            Paddle[PaddleOCR<br/>Multi-language]
            TrOCR[TrOCR<br/>Handwriting]
        end
        
        ResultMerger[Result Merger<br/>• Voting<br/>• Confidence]
    end
    
    subgraph "Grading Pipeline"
        TextAnalyzer[Text Analyzer<br/>• Parse questions<br/>• Extract answers]
        GradingEngine[Grading Engine<br/>• Rubric match<br/>• Score calc]
        LLMProcessor[LLM Processor<br/>• GPT-4<br/>• Claude]
        FeedbackGen[Feedback Generator<br/>• Personalized<br/>• Actionable]
    end
    
    subgraph "Analytics"
        PatternDetector[Pattern Detector<br/>• Common mistakes<br/>• Struggle areas]
        InsightsGen[Insights Generator<br/>• Class trends<br/>• Recommendations]
    end
    
    PDF --> Preprocessor
    Images --> Preprocessor
    Handwritten --> Preprocessor
    
    Preprocessor --> OCRRouter
    OCRRouter --> Tesseract
    OCRRouter --> Paddle
    OCRRouter --> TrOCR
    
    Tesseract --> ResultMerger
    Paddle --> ResultMerger
    TrOCR --> ResultMerger
    
    ResultMerger --> TextAnalyzer
    TextAnalyzer --> GradingEngine
    GradingEngine --> LLMProcessor
    LLMProcessor --> FeedbackGen
    
    FeedbackGen --> PatternDetector
    PatternDetector --> InsightsGen
```

---

# API Documentation


## API Endpoints Detail

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/auth/register` | Register new user | `{email, password, firstName, lastName}` | `{success}` |
| POST | `/api/auth/login` | User login | `{email, password}` | `{refreshToken, user}` |
| POST | `/api/auth/refresh` | Refresh token | `{refreshToken}` | `{token, refreshToken}` |
| POST | `/api/auth/logout` | Logout user | - | `{success}` |
| POST | `/api/auth/verify-email` | Verify email | `{token}` | `{success}` |
| POST | `/api/auth/reset-password?token` | Reset password | `{email}` or `{token, password}` | `{success}` |

### Course Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/courses` | List all courses | - | `{courses[]}` |
| GET | `/api/courses/{id}` | Get course details | - | `{course}` |
| POST | `/api/courses` | Create course | `{name, description}` | `{course}` |
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

## Deployment Architecture

```mermaid
graph TB
    subgraph "Internet"
        Users[Users]
        CloudFlare[CloudFlare CDN<br/>• DDoS Protection<br/>• Global Cache]
    end
    
    subgraph "Load Balancing"
        Nginx[Nginx LB<br/>• SSL Termination<br/>• Request Routing]
    end
    
    subgraph "Application Servers"
        Frontend[Frontend Pods<br/>Next.js x3]
        Backend[Backend Pods<br/>NestJS x3]
        AIServices[AI Service Pods<br/>FastAPI x2]
    end
    
    subgraph "Databases"
        PGCluster[PostgreSQL<br/>• Primary<br/>• Replica]
        MongoCluster[MongoDB<br/>• Replica Set]
        RedisCluster[Redis<br/>• Master-Slave]
    end
    
    subgraph "Storage & Queue"
        MinIO[MinIO<br/>Object Storage]
        RabbitMQ[RabbitMQ<br/>Message Queue]
    end
    
    subgraph "Monitoring"
        Prometheus[Prometheus<br/>Metrics]
        Grafana[Grafana<br/>Dashboards]
        Logs[ELK Stack<br/>Logging]
    end
    
    Users --> CloudFlare
    CloudFlare --> Nginx
    Nginx --> Frontend
    Nginx --> Backend
    Backend --> AIServices
    
    Backend --> PGCluster
    Backend --> MongoCluster
    Backend --> RedisCluster
    
    AIServices --> MinIO
    Backend --> RabbitMQ
    
    Backend --> Prometheus
    AIServices --> Prometheus
    Prometheus --> Grafana
    Backend --> Logs
```

## User Journey Map

```mermaid
graph LR
    subgraph "Student Journey"
        S1[Land on Site] --> S2[Register/Login]
        S2 --> S3[Browse Courses]
        S3 --> S4[Join Course]
        S4 --> S5[View Materials]
        S5 --> S6[Check Assignment]
        S6 --> S7[Complete Work]
        S7 --> S8[Upload Submission]
        S8 --> S9[AI Grading]
        S9 --> S10[Receive Feedback]
        S10 --> S11[Review Mistakes]
        S11 --> S12[Improve]
    end
    
    subgraph "Teacher Journey"
        T1[Login] --> T2[Create Course]
        T2 --> T3[Upload Materials]
        T3 --> T4[Create Assignment]
        T4 --> T5[Set Rubric]
        T5 --> T6[Monitor Submissions]
        T6 --> T7[View AI Grades]
        T7 --> T8[Check Insights]
        T8 --> T9[Identify Struggles]
        T9 --> T10[Provide Support]
    end
    
    S8 -.-> T6
    T7 -.-> S10
```

## State Diagram - Assignment Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft: Create
    
    Draft --> Scheduled: Schedule
    Draft --> Published: Publish Now
    
    Scheduled --> Published: Time Reached
    
    Published --> Active: Available
    
    Active --> Submitted: Student Submits
    Active --> Late: Past Due
    
    Submitted --> Processing: Start Grading
    Late --> Submitted: Late Submit
    
    Processing --> OCR: Extract Text
    OCR --> Grading: Analyze
    Grading --> Generating: Create Feedback
    Generating --> Graded: Complete
    
    Graded --> Reviewed: Teacher Review
    Reviewed --> Final: Approve
    Reviewed --> Regraded: Request Regrade
    
    Regraded --> Processing: Reprocess
    
    Final --> Archived: Archive
    Archived --> [*]
    
    Published --> Cancelled: Cancel
    Cancelled --> [*]
```

## Security Architecture

```mermaid
graph TB
    subgraph "Perimeter Security"
        CloudFlare[CloudFlare<br/>• DDoS Protection<br/>• WAF Rules]
        Firewall[Firewall<br/>• IP Whitelist<br/>• Port Control]
    end
    
    subgraph "Application Security"
        HTTPS[HTTPS/TLS<br/>• SSL Certificates<br/>• Encryption]
        Auth[Authentication<br/>• JWT Tokens<br/>• MFA Support]
        RBAC[Authorization<br/>• Role-Based<br/>• Permissions]
        Validation[Validation<br/>• Input Sanitization<br/>• XSS Prevention]
    end
    
    subgraph "API Security"
        RateLimit[Rate Limiting<br/>• Per User<br/>• Per IP]
        CORS[CORS Policy<br/>• Origin Control]
        APIKeys[API Keys<br/>• Service Auth]
    end
    
    subgraph "Data Security"
        Encryption[Encryption<br/>• At Rest<br/>• In Transit]
        Hashing[Hashing<br/>• Bcrypt<br/>• Salted]
        Backup[Backups<br/>• Daily<br/>• Encrypted]
    end
    
    subgraph "Monitoring"
        Audit[Audit Logs<br/>• All Actions<br/>• Immutable]
        SIEM[SIEM<br/>• Threat Detection<br/>• Alerts]
    end
    
    CloudFlare --> Firewall
    Firewall --> HTTPS
    HTTPS --> Auth
    Auth --> RBAC
    RBAC --> Validation
    
    Validation --> RateLimit
    RateLimit --> CORS
    CORS --> APIKeys
    
    APIKeys --> Encryption
    Encryption --> Hashing
    Hashing --> Backup
    
    Backup --> Audit
    Audit --> SIEM
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