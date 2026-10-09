# 🚗 Ambika Spare Parts — Inventory Management System

A full-stack **Inventory Management System** for managing automobile spare parts, inventory records, and related operations.

The project is built using **React.js**, **Node.js**, and **MySQL**, and is designed around a **three-tier AWS deployment architecture**.

## 🌐 Live Application

**Live Demo:**  
https://ambika-spare-parts.netlify.app/

> The live link is provided as a demonstration of the application UI. The deployment architecture documented in this project is based on AWS services.



# 🏗️ AWS Three-Tier Architecture

The application follows a three-tier architecture:

```text
                         ┌───────────────┐
                         │    USERS      │
                         └───────┬───────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │ Application Load        │
                    │ Balancer (ALB)          │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │       EC2 Instance      │
                    │                         │
                    │    Node.js Backend      │
                    │       Port 3000         │
                    └────────────┬───────────┘
                                 │
                                 │ MySQL : 3306
                                 ▼
                    ┌────────────────────────┐
                    │      Amazon RDS         │
                    │        MySQL            │
                    │                         │
                    │     Inventory DB        │
                    └────────────────────────┘

              React Frontend
                    │
                    ▼
             Backend API / ALB
```

### Architecture Layers

| Layer | Technology | AWS Service |
|---|---|---|
| Presentation | React.js | EC2 / Static hosting |
| Application | Node.js + Express | Amazon EC2 |
| Database | MySQL | Amazon RDS |
| Traffic Distribution | HTTP | Application Load Balancer |
| Networking | VPC | Amazon VPC |
| Security | Firewall rules | Security Groups |

The database is isolated from direct public access and accepts MySQL traffic from the application layer. AWS recommends using security groups to control access between EC2 application servers and RDS databases.

---

# ✨ Features

- 📦 Inventory management
- 🔧 Spare parts management
- ➕ Add inventory items
- ✏️ Update inventory information
- 🗑️ Delete inventory items
- 🔍 Search and manage spare parts
- 📊 Inventory overview
- 🌐 REST API based backend
- 🗄️ MySQL database
- ☁️ AWS-based deployment architecture

---

# 🛠️ Technology Stack

## Frontend

- React.js
- JavaScript
- HTML5
- CSS3
- REST API integration

## Backend

- Node.js
- Express.js
- REST APIs
- MySQL Driver
- dotenv

## Database

- MySQL
- Amazon RDS for MySQL

## AWS

- Amazon EC2
- Amazon RDS
- Application Load Balancer
- Amazon VPC
- Security Groups

---

# ☁️ AWS Deployment Architecture

## 1. Amazon VPC

The application components are deployed within an AWS VPC.

The VPC provides the networking environment for:

- EC2
- RDS
- Application Load Balancer
- Security Groups

---

## 2. Frontend Layer

The frontend is developed using React.js.

The React application communicates with the Node.js backend through HTTP API requests.

```text
React Frontend
      │
      │ API Request
      ▼
Application Load Balancer
```

---

## 3. Backend Layer — Amazon EC2

The Node.js backend is deployed on an Amazon EC2 instance.

The backend runs on:

```text
Port: 3000
```

The backend provides REST APIs used by the React frontend.

Example:

```text
GET    /api/...
POST   /api/...
PUT    /api/...
DELETE /api/...
```

The exact API endpoints depend on the application implementation.

---

# 🗄️ 4. Database Layer — Amazon RDS

The application uses **Amazon RDS for MySQL** as its database layer.

Example configuration:

```text
Database Engine: MySQL
Port: 3306
Database: inventory
```

The Node.js backend connects to RDS using environment variables.

Example:

```env
DB_HOST=<RDS-ENDPOINT>
DB_USER=<RDS-USERNAME>
DB_PASSWORD=<RDS-PASSWORD>
DB_NAME=inventory
DB_PORT=3306
```

Database credentials are not stored directly inside the source code.

---

# 🔐 5. Security Groups

Separate security groups are used to control communication between the application components.

### ALB Security Group

Allows:

```text
HTTP  : 80   → Internet
HTTPS : 443  → Internet (if configured)
```

### Backend EC2 Security Group

Allows:

```text
Port 3000 → Application Load Balancer
SSH 22    → Administrator IP
```

### RDS Security Group

Allows:

```text
MySQL 3306 → Backend EC2 Security Group
```

The database is not intended to accept direct public MySQL connections.

This follows the AWS security-group model where the RDS security group can reference the application's EC2 security group as the allowed source.

---

# ⚖️ 6. Application Load Balancer

An **Application Load Balancer (ALB)** is used to handle application traffic.

```text
Client
   │
   ▼
ALB : 80
   │
   ▼
EC2 : 3000
   │
   ▼
RDS : 3306
```

The ALB forwards incoming requests to the registered EC2 target.

AWS Application Load Balancers use listeners and target groups to route client requests to targets such as EC2 instances.

---

# 🔄 Application Request Flow

The complete request flow is:

```text
1. User opens the React application
                │
                ▼
2. React sends API request
                │
                ▼
3. Application Load Balancer
                │
                ▼
4. Node.js Backend on EC2
                │
                ▼
5. Backend processes request
                │
                ▼
6. Backend communicates with RDS MySQL
                │
                ▼
7. RDS returns database result
                │
                ▼
8. Node.js sends API response
                │
                ▼
9. React displays the result
```

---

# 🚀 Deployment Steps

## Step 1 — Prepare React Frontend

Build the React application:

```bash
npm install
npm run build
```

The production build is generated in the build output directory used by the project.

---

## Step 2 — Prepare Node.js Backend

Install dependencies:

```bash
npm install
```

Configure environment variables:

```env
DB_HOST=<RDS-ENDPOINT>
DB_USER=<RDS-USERNAME>
DB_PASSWORD=<RDS-PASSWORD>
DB_NAME=inventory
DB_PORT=3306
```

Start the backend:

```bash
npm start
```

The backend runs on:

```text
Port 3000
```

---

## Step 3 — Create AWS VPC

Create or use an AWS VPC containing the application resources.

The VPC provides networking between:

```text
ALB
 │
EC2
 │
RDS
```

---

## Step 4 — Create RDS MySQL

Create an Amazon RDS MySQL database.

Configure:

```text
Engine       → MySQL
Database     → inventory
Port         → 3306
```

Obtain the RDS endpoint after the database becomes available.

---

## Step 5 — Create EC2 Instance

Launch an EC2 instance for the Node.js backend.

Install:

- Node.js
- npm
- Git

Clone the backend project:

```bash
git clone <YOUR-BACKEND-REPOSITORY>
```

Install dependencies:

```bash
npm install
```

Configure the RDS environment variables and start the backend.

---

# 🔗 Backend → RDS Connection

The backend uses the RDS endpoint instead of:

```text
localhost
```

Example:

```env
DB_HOST=inventory-db.xxxxxxxxxxxx.ap-south-1.rds.amazonaws.com
DB_PORT=3306
```

The EC2 instance communicates with RDS over MySQL port `3306`.

---

# ⚖️ Step 6 — Configure Application Load Balancer

Create:

```text
Load Balancer
      ↓
Target Group
      ↓
EC2 Instance
```

Example configuration:

```text
Load Balancer Type : Application Load Balancer
Listener           : HTTP : 80
Target Type        : Instance
Target Port         : 3000
Health Check       : HTTP
```

The ALB forwards requests to the Node.js backend running on EC2.

---

# 🩺 Health Check

The target group checks whether the Node.js application is healthy.

Example:

```text
ALB
 │
 ├── Health Check
 │
 ▼
EC2 : 3000
```

A healthy target allows the ALB to forward application traffic to the EC2 instance.

---

# 🧪 Testing

The complete architecture can be tested layer by layer.

### Frontend Test

Open:

```text
https://ambika-spare-parts.netlify.app/
```

### Backend Test

Access the backend through the configured ALB endpoint.

Example:

```text
http://<ALB-DNS-NAME>
```

### Database Test

Perform an operation from the frontend such as:

```text
Add Spare Part
       ↓
React
       ↓
ALB
       ↓
Node.js / EC2
       ↓
RDS MySQL
```

Verify that the record is successfully stored in RDS.

---

# 📊 Three-Tier Communication

```text
┌─────────────────┐
│  PRESENTATION   │
│                 │
│    React.js     │
└────────┬────────┘
         │
         │ REST API
         ▼
┌─────────────────┐
│   APPLICATION   │
│                 │
│ Node.js / EC2   │
└────────┬────────┘
         │
         │ MySQL
         ▼
┌─────────────────┐
│      DATA       │
│                 │
│ RDS MySQL       │
└─────────────────┘
```

---

# 🔐 Security Architecture

```text
                 INTERNET
                    │
                    ▼
             ┌─────────────┐
             │     ALB     │
             │   SG-ALB    │
             └──────┬──────┘
                    │
              Port 3000
                    │
                    ▼
             ┌─────────────┐
             │     EC2     │
             │   SG-APP    │
             └──────┬──────┘
                    │
              Port 3306
                    │
                    ▼
             ┌─────────────┐
             │     RDS     │
             │   SG-DB     │
             └─────────────┘
```

Security groups act as virtual firewalls for AWS resources and can restrict database access to the application layer.

---

# 📁 Project Structure

```text
inventory-management-system/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   ├── package.json
│   ├── .env
│   └── ...
│
└── README.md
```

> `.env` should not be committed to GitHub.

Add:

```text
.env
node_modules/
```

to `.gitignore`.

---

# 🎯 Project Objective

The main objective of this project is to understand how a full-stack application can be separated into independent infrastructure layers and deployed using AWS.

The project demonstrates:

- Three-tier application architecture
- AWS VPC networking
- EC2 application deployment
- Amazon RDS database deployment
- Application Load Balancer
- Security Groups
- Backend-to-database communication
- Frontend-to-backend communication
- Cloud-based application deployment

---

# 📚 AWS Services Used

| AWS Service | Purpose |
|---|---|
| Amazon EC2 | Hosts Node.js backend |
| Amazon RDS | Hosts MySQL database |
| Application Load Balancer | Routes application traffic |
| Amazon VPC | Provides network infrastructure |
| Security Groups | Controls network access |

---

# 🔗 Useful Links

### Live Application

https://ambika-spare-parts.netlify.app/

### AWS Documentation

- Amazon RDS
- Amazon EC2
- Application Load Balancer
- Amazon VPC
- Security Groups

---

# 👨‍💻 Author

**Jay Shinde**

Java Full Stack Developer | AWS | React | Node.js | Spring Boot

---

# ⭐ Project Summary

**Ambika Spare Parts Inventory Management System** demonstrates the deployment of a full-stack inventory application using a three-tier architecture.

```text
React Frontend
      ↓
Application Load Balancer
      ↓
Node.js Backend — EC2
      ↓
MySQL Database — RDS
```

The architecture separates the presentation, application, and database layers, while AWS networking and security groups control communication between the components.