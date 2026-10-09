# 🚀 Scalable Web Application Using AWS ALB & Auto Scaling

A highly available and scalable web application deployed on AWS using **Amazon EC2, Application Load Balancer, Auto Scaling Group, Security Groups, and CloudWatch**.

The application is designed to distribute incoming HTTP traffic across multiple EC2 instances and automatically replace instances when one becomes unavailable.

Each EC2 instance displays its own **Instance ID and Hostname**, making it easy to visually demonstrate how the Application Load Balancer distributes traffic between backend servers.

---

## 📌 Project Overview

This project demonstrates how to build a scalable web application infrastructure on AWS.

Instead of sending users directly to a single EC2 instance, incoming traffic is routed through an **Application Load Balancer (ALB)**.

The ALB distributes requests across healthy EC2 instances managed by an **Auto Scaling Group (ASG)**.

If an EC2 instance becomes unavailable, the Auto Scaling Group automatically launches a replacement instance.

### Main goals

* Deploy a web application on EC2
* Create a reusable EC2 AMI
* Create an EC2 Launch Template
* Configure an Auto Scaling Group
* Configure an Application Load Balancer
* Configure Target Groups and health checks
* Distribute traffic across multiple EC2 instances
* Automatically replace failed instances
* Demonstrate high availability and scalability

---

# 🏗️ Architecture


                         Internet
                            │
                            │ HTTP :80
                            ▼
              ┌──────────────────────────┐
              │ Application Load Balancer │
              │          (ALB)            │
              └────────────┬─────────────┘
                           │
                    Target Group
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
      ┌──────────────┐           ┌──────────────┐
      │   EC2 #1     │           │   EC2 #2     │
      │              │           │              │
      │    Nginx     │           │    Nginx     │
      │      ↓       │           │      ↓       │
      │    Flask     │           │    Flask     │
      │      ↓       │           │      ↓       │
      │ EC2 Metadata │           │ EC2 Metadata │
      └──────────────┘           └──────────────┘
             ▲                           ▲
             │                           │
             └─────────────┬─────────────┘
                           │
                   Auto Scaling Group
                           │
                    ┌──────┴──────┐
                    │             │
                 Min: 2         Max: 4
```

---

# ☁️ AWS Services Used

| AWS Service               | Purpose                                       |
| ------------------------- | --------------------------------------------- |
| Amazon EC2                | Runs the web application                      |
| Application Load Balancer | Distributes incoming traffic                  |
| Auto Scaling Group        | Maintains the required number of instances    |
| Launch Template           | Defines how new EC2 instances are created     |
| Amazon Machine Image      | Provides the reusable server configuration    |
| Target Group              | Maintains and health-checks backend instances |
| Security Groups           | Controls network access                       |
| CloudWatch                | Provides monitoring and scaling metrics       |
| EC2 Instance Metadata     | Provides instance-specific information        |

---

# 🛠️ Application Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Python
* Flask

### Web Server

* Nginx

### Cloud

* Amazon EC2
* Application Load Balancer
* Auto Scaling Group
* Amazon CloudWatch
* IAM
* Security Groups

---

# 📂 Project Structure

```text
scalable-web-application-aws/
│
├── web-app/
│   └── index.html
│
├── backend/
│   └── server.py
│
├── nginx/
│   └── default.conf
│
├── systemd/
│   └── server-info.service
│
├── screenshots/
│   ├── 01-ec2-instance.png
│   ├── 02-web-application.png
│   ├── 03-ami.png
│   ├── 04-launch-template.png
│   ├── 05-auto-scaling-group.png
│   ├── 06-target-group-healthy.png
│   ├── 07-application-load-balancer.png
│   ├── 08-multiple-instances.png
│   └── 09-auto-scaling-replacement.png
│
├── demo/
│   └── demo.mp4
│
├── .gitignore
└── README.md
```

---

# ⚙️ Implementation

## 1. Launch EC2 Instance

The first EC2 instance was configured as the base server.

Configuration included:

* Ubuntu Linux
* Nginx
* Python
* Flask
* Security Group
* HTTP access on port 80

The base EC2 instance was used to prepare the application environment before creating the AMI.

---

## 2. Deploy the Web Application

A simple web application was created to display:

```text
Server: EC2 Instance

Hostname: <EC2 hostname>

Instance ID: <EC2 instance ID>

Status: Server is running successfully
```

Displaying the instance information makes it possible to visually demonstrate which EC2 instance handled a request.

---

## 3. Configure Flask

Flask provides the `/server-info` endpoint.

The endpoint uses the EC2 Instance Metadata Service to retrieve:

* EC2 Instance ID
* EC2 Hostname

Example response:

```text
Instance ID: i-0235ac0b36be32d58

Hostname:
ip-172-31-13-149.ap-south-1.compute.internal
```

---

## 4. Configure Nginx

Nginx serves the frontend application on port `80`.

Requests to:

```text
/server-info
```

are forwarded to Flask running locally on:

```text
127.0.0.1:5000
```

The request flow is:

```text
Browser
   ↓
Nginx :80
   ↓
Flask :5000
   ↓
EC2 Instance Metadata
```

---

## 5. Configure systemd

Flask was configured as a systemd service.

This ensures that the Flask application automatically starts whenever an EC2 instance starts.

```text
EC2 starts
    ↓
systemd
    ↓
Flask starts
    ↓
Nginx
    ↓
/server-info
```

This is especially important for Auto Scaling because newly created EC2 instances must automatically start the application without manual configuration.

---

# 📦 Amazon Machine Image

After configuring the base EC2 instance, an AMI was created.

The final AMI contains:

* Nginx
* Flask
* Web application
* `/server-info`
* systemd configuration

This AMI becomes the base image for new EC2 instances launched by the Auto Scaling Group.

---

# 🚀 Launch Template

A Launch Template was created using the final AMI.

The Launch Template defines:

* AMI
* Instance type
* Key pair
* Security Group
* Instance configuration

Whenever the Auto Scaling Group needs a new EC2 instance, it uses this Launch Template.

---

# 📈 Auto Scaling Group

The Auto Scaling Group was configured with:

```text
Minimum capacity: 2
Desired capacity: 2
Maximum capacity: 4
```

This ensures that the application normally has at least two backend instances available.

Example:

```text
Auto Scaling Group

Minimum: 2
Desired: 2
Maximum: 4
```

---

# ⚖️ Application Load Balancer

An internet-facing Application Load Balancer was created.

The ALB listens on:

```text
HTTP :80
```

Incoming requests are forwarded to the Target Group.

```text
User
 ↓
ALB
 ↓
Target Group
 ↓
Healthy EC2 instances
```

---

# ❤️ Health Checks

The Target Group uses HTTP health checks.

Health check path:

```text
/
```

Port:

```text
80
```

Only healthy instances receive traffic from the Application Load Balancer.

---

# 🔐 Security Groups

Two security groups were used.

## ALB Security Group

Allows:

```text
HTTP :80
Source: 0.0.0.0/0
```

## EC2 Security Group

Allows HTTP traffic from the ALB security group.

```text
HTTP :80
Source: ALB Security Group
```

SSH access is restricted to the administrator's IP address.

This prevents direct public access to the backend instances.

---

# 🔄 Load Balancing Demonstration

The application displays the EC2 instance information.

When accessing the application through the ALB, requests can be handled by different EC2 instances.

Example:

```text
Request 1
→ EC2 Instance A

Request 2
→ EC2 Instance B

Request 3
→ EC2 Instance A

Request 4
→ EC2 Instance B
```

The instance ID displayed on the page makes the distribution visible.

---

# 💥 Auto Scaling / Self-Healing Demonstration

One of the EC2 instances managed by the Auto Scaling Group was manually terminated.

Before termination:

```text
Desired Capacity: 2

EC2 #1 → Running
EC2 #2 → Running
```

After terminating one instance:

```text
Desired Capacity: 2

EC2 #1 → Running
EC2 #2 → Terminated
```

The Auto Scaling Group detected that the number of running instances was below the desired capacity.

It automatically launched a replacement instance.

```text
Auto Scaling Group
        ↓
Detects missing instance
        ↓
Launches replacement EC2
        ↓
Instance starts
        ↓
Flask starts through systemd
        ↓
Nginx starts
        ↓
Target Group health check
        ↓
Healthy
        ↓
ALB sends traffic
```

Final state:

```text
EC2 #1 → Running → Healthy
EC2 #2 → New replacement → Healthy
```

This demonstrates the self-healing behavior of the Auto Scaling Group.

---

# 📊 Scaling Concept

CloudWatch metrics can be used by the Auto Scaling Group to determine when additional capacity is required.

The project uses a target tracking policy based on CPU utilization.

Example configuration:

```text
Target CPU utilization: 50%
Minimum instances: 2
Maximum instances: 4
```

When demand increases, the Auto Scaling Group can launch additional instances.

```text
2 EC2
  ↓
Higher workload
  ↓
CloudWatch metrics
  ↓
Auto Scaling
  ↓
3 EC2
  ↓
Higher workload
  ↓
4 EC2
```

The maximum capacity prevents the group from growing beyond the configured limit.

---

# 🧪 Testing Performed

The following scenarios were tested:

### Test 1 — EC2 Web Application

```text
EC2
 ↓
Nginx
 ↓
Web Application
```

Result:

```text
PASS ✅
```

### Test 2 — Target Group Health

Two EC2 instances were registered through the Auto Scaling Group.

Result:

```text
EC2 #1 → Healthy ✅
EC2 #2 → Healthy ✅
```

### Test 3 — Application Load Balancer

The application was accessed through the ALB DNS name.

Result:

```text
PASS ✅
```

### Test 4 — Load Distribution

Requests through the ALB were observed reaching backend instances.

Result:

```text
PASS ✅
```

### Test 5 — Instance Failure

One ASG-managed EC2 instance was terminated manually.

Result:

```text
Replacement instance automatically created ✅
```

### Test 6 — Health Check

The replacement instance became healthy before receiving traffic.

Result:

```text
PASS ✅
```

---

# 📸 Screenshots

Screenshots are included to document the AWS configuration and testing process.

Recommended screenshots:

### EC2

![EC2 Instance](screenshots/01-ec2-instance.png)

### Web Application

![Web Application](screenshots/02-web-application.png)

### AMI

![AMI](screenshots/03-ami.png)

### Launch Template

![Launch Template](screenshots/04-launch-template.png)

### Auto Scaling Group

![Auto Scaling Group](screenshots/05-auto-scaling-group.png)

### Target Group

![Target Group](screenshots/06-target-group-healthy.png)

### Application Load Balancer

![Application Load Balancer](screenshots/07-application-load-balancer.png)

### Multiple Instances

![Multiple Instances](screenshots/08-multiple-instances.png)

### Automatic Replacement

![Automatic Replacement](screenshots/09-auto-scaling-replacement.png)

---

# 🎥 Demo

A complete video demonstration is included in the repository.

The demo shows:

1. AWS EC2 instances
2. Application Load Balancer
3. Target Group health
4. Traffic distribution
5. Instance information
6. Termination of an ASG-managed instance
7. Automatic replacement of the terminated instance
8. New instance becoming healthy

### Demo Video

[▶️ Watch the project demonstration](demo/demo.mp4)

---

# 🔄 Complete Request Flow

```text
                    User
                     │
                     ▼
            Application Load
               Balancer
                     │
                     ▼
               Target Group
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
       EC2 #1                EC2 #2
          │                     │
        Nginx                 Nginx
          │                     │
        Flask                 Flask
          │                     │
          ▼                     ▼
    EC2 Metadata          EC2 Metadata
          │                     │
          └──────────┬──────────┘
                     │
                     ▼
             Instance ID
              + Hostname
```

---

# 🔁 Self-Healing Flow

```text
EC2 Instance Running
        │
        ▼
Instance Terminated
        │
        ▼
Auto Scaling detects
capacity below desired
        │
        ▼
Launch Template
        │
        ▼
New EC2 Instance
        │
        ▼
AMI boots
        │
        ▼
systemd starts Flask
        │
        ▼
Nginx starts
        │
        ▼
Target Group Health Check
        │
        ▼
Healthy
        │
        ▼
ALB sends traffic
```

---

# 💰 AWS Free Tier / Cost Note

This project was created as a learning project using AWS free-tier-eligible resources where applicable.

AWS pricing and free-tier eligibility can change, so users should verify current pricing before deploying.

After completing the demonstration, unnecessary resources should be removed to avoid unexpected charges.

Resources to check and clean up:

```text
EC2 instances
Auto Scaling Group
Application Load Balancer
Target Group
Launch Template
EBS volumes
AMI
Snapshots
CloudWatch resources
```

Do not delete resources until you have finished your demonstration and captured the required screenshots/video.

---

# 🎯 Learning Outcomes

Through this project, I learned how to:

* Deploy applications on Amazon EC2
* Configure Nginx as a web server and reverse proxy
* Build a lightweight Flask backend
* Use EC2 Instance Metadata
* Create Amazon Machine Images
* Create Launch Templates
* Configure Auto Scaling Groups
* Configure Application Load Balancers
* Configure Target Groups
* Configure health checks
* Use Security Groups
* Understand high availability
* Understand horizontal scaling
* Demonstrate load balancing
* Implement automatic instance replacement
* Configure systemd services for automatic application startup
* Understand the relationship between ALB, ASG, EC2 and CloudWatch

---

# 🚀 Future Improvements

Possible improvements include:

* HTTPS using ACM
* Custom domain using Route 53
* HTTPS listener on the ALB
* CloudWatch dashboards
* CloudWatch alarms
* CPU stress testing
* Automatic scaling demonstration
* HTTPS security headers
* Docker container deployment
* CI/CD using GitHub Actions
* Infrastructure as Code using Terraform
* Private EC2 subnets with NAT Gateway
* Multi-AZ production architecture

---

# 👨‍💻 Author

**Jay Shinde**

Java Full Stack Developer | Spring Boot | React | Node.js | Docker | AWS

This project was built as part of my hands-on AWS learning and cloud deployment practice.

---

⭐ If you found this project useful, consider giving the repository a star.
