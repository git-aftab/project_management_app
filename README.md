# Project Camp Backend - RESTful API for Project Management

A robust, scalable **Node.js REST API** for collaborative project management with role-based access control, task management, and team collaboration features.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## 🚀 Features

### Authentication & Security
- **JWT Authentication** - Secure token-based authentication with refresh token support
- **Email Verification** - Account verification via email tokens
- **Password Management** - Complete password reset and change functionality
- **Role-Based Access Control (RBAC)** - Three-tier permission system (Admin, Project Admin, Member)

### Project Management
- **Complete Project Lifecycle** - Create, read, update, and delete projects
- **Team Collaboration** - Add members, assign roles, manage permissions
- **Project Overview** - View projects with member counts and details

### Task Management System
- **Hierarchical Task Organization** - Tasks with subtasks for granular project breakdown
- **Task Assignment** - Assign tasks to specific team members
- **Status Tracking** - Three-state workflow (Todo, In Progress, Done)
- **File Attachments** - Multiple file upload support for tasks
- **Subtask Management** - Create, update, and track subtask completion

### Project Notes
- **Centralized Documentation** - Create and manage project notes
- **Admin-Controlled** - Secure note management with admin-only permissions

## 📋 Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Permission Matrix](#permission-matrix)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Usage Examples](#usage-examples)
- [Contributing](#contributing)
- [License](#license)

## ⚙️ Installation

### Prerequisites

- Node.js (>= 14.0.0)
- npm or yarn
- MongoDB database
- SMTP server for email functionality

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/git-aftab/project_management_app.git
cd project_management_app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the development server**
```bash
npm run dev
```

5. **For production**
```bash
npm start
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@projectcamp.com

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/images
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |
| GET | `/auth/current-user` | Get current user | Yes |
| POST | `/auth/change-password` | Change password | Yes |
| POST | `/auth/refresh-token` | Refresh access token | No |
| GET | `/auth/verify-email/:token` | Verify email | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password/:token` | Reset password | No |
| POST | `/auth/resend-email-verification` | Resend verification | Yes |

### Project Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/projects` | List user projects | All authenticated |
| POST | `/projects` | Create project | All authenticated |
| GET | `/projects/:projectId` | Get project details | Project members |
| PUT | `/projects/:projectId` | Update project | Admin only |
| DELETE | `/projects/:projectId` | Delete project | Admin only |
| GET | `/projects/:projectId/members` | List members | Project members |
| POST | `/projects/:projectId/members` | Add member | Admin only |
| PUT | `/projects/:projectId/members/:userId` | Update role | Admin only |
| DELETE | `/projects/:projectId/members/:userId` | Remove member | Admin only |

### Task Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/tasks/:projectId` | List tasks | Project members |
| POST | `/tasks/:projectId` | Create task | Admin/Project Admin |
| GET | `/tasks/:projectId/t/:taskId` | Get task details | Project members |
| PUT | `/tasks/:projectId/t/:taskId` | Update task | Admin/Project Admin |
| DELETE | `/tasks/:projectId/t/:taskId` | Delete task | Admin/Project Admin |
| POST | `/tasks/:projectId/t/:taskId/subtasks` | Create subtask | Admin/Project Admin |
| PUT | `/tasks/:projectId/st/:subTaskId` | Update subtask | Project members |
| DELETE | `/tasks/:projectId/st/:subTaskId` | Delete subtask | Admin/Project Admin |

### Note Endpoints

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/notes/:projectId` | List notes | Project members |
| POST | `/notes/:projectId` | Create note | Admin only |
| GET | `/notes/:projectId/n/:noteId` | Get note details | Project members |
| PUT | `/notes/:projectId/n/:noteId` | Update note | Admin only |
| DELETE | `/notes/:projectId/n/:noteId` | Delete note | Admin only |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/healthcheck` | API health status |

## 🔑 Permission Matrix

| Feature | Admin | Project Admin | Member |
|---------|-------|---------------|--------|
| Create Project | ✅ | ❌ | ❌ |
| Update/Delete Project | ✅ | ❌ | ❌ |
| Manage Members | ✅ | ❌ | ❌ |
| Create/Update/Delete Tasks | ✅ | ✅ | ❌ |
| View Tasks | ✅ | ✅ | ✅ |
| Update Subtask Status | ✅ | ✅ | ✅ |
| Create/Delete Subtasks | ✅ | ✅ | ❌ |
| Create/Update/Delete Notes | ✅ | ❌ | ❌ |
| View Notes | ✅ | ✅ | ✅ |

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **File Upload:** Multer
- **Email:** Nodemailer
- **Validation:** Express Validator
- **Security:** bcrypt, helmet, cors

## 📁 Project Structure

```
project-camp-backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── app.js          # Express app setup
├── public/
│   └── images/         # Uploaded files
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
└── server.js           # Entry point
```

## 💡 Usage Examples

### Register a New User

```javascript
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Create a Project

```javascript
POST /api/v1/projects
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "New Mobile App",
  "description": "Development of iOS and Android application"
}
```

### Create a Task with Assignment

```javascript
POST /api/v1/tasks/:projectId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Design Homepage",
  "description": "Create wireframes and mockups",
  "assignedTo": "user_id_here",
  "status": "todo"
}
```

### Add a Team Member

```javascript
POST /api/v1/projects/:projectId/members
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "email": "teammate@example.com",
  "role": "project_admin"
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Express.js and MongoDB
- Inspired by modern project management tools
- Community contributions and feedback

## 📞 Support

For support, email aftabdev18dev@gmail.com or open an issue in the GitHub repository.

## 🔗 Links

- [LinkedIn](www.linkedin.com/in/md-aftab-360996328)
---

**Built with ❤️ by Md Aftab Ansari**
