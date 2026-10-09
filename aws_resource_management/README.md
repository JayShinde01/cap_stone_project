# AWS Resource Manager

AWS Resource Manager is a small beginner-friendly command-line application written
in Python. It provides one menu for common Amazon S3 and Amazon EC2 operations
using the `boto3` AWS SDK.

## AWS services used

- **Amazon S3**: create buckets, upload files, and list buckets.
- **Amazon EC2**: launch, list, stop, and terminate instances.
- **AWS IAM / AWS CLI credentials**: authenticate requests without putting
  credentials in the source code.

## Project architecture and flow

```text
User
  |
  v
Python CLI
  |
  +----> AWS S3
  |
  +----> AWS EC2
  |
  +----> AWS IAM / Credentials
```

The program displays a menu in a `while True` loop. Your selection calls one
simple Python function, which creates a `boto3.client(...)` and sends the
corresponding request to AWS. Errors are shown in the terminal instead of
silently failing.

## Prerequisites

1. Python 3.8 or newer installed.
2. An AWS account.
3. AWS CLI installed and available in your terminal.
4. IAM permissions for the operations you want to perform. For learning,
   use an IAM user or role with appropriately limited permissions rather than
   an account root user.
5. An EC2 key pair and a valid AMI ID if you want to launch an instance.

## Install the AWS CLI

Follow the official AWS CLI installation guide for your operating system:

<https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>

Check the installation with:

```bash
aws --version
```

## Configure AWS credentials

Configure the AWS CLI before running this project:

```bash
aws configure
```

Enter your AWS Access Key ID, Secret Access Key, default region (for example,
`us-east-1`), and output format when prompted. Boto3 reads these normal AWS CLI
credentials automatically. Do not put access keys, secret keys, passwords, or
tokens in `aws_manager.py`.

## Set up a Python virtual environment

From this project directory, run the following on Windows:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## Install dependencies

With the virtual environment activated:

```bash
python -m pip install -r requirements.txt
```

## Run the project

```bash
python aws_manager.py
```

## Menu options

1. **Create S3 Bucket** asks for a globally unique bucket name and creates it
   in the region configured with `aws configure`.
2. **Upload File to S3** asks for a bucket and local file path. The file is
   uploaded using its local file name as the S3 object name.
3. **List S3 Buckets** displays all buckets visible in the AWS account.
4. **Launch EC2 Instance** asks for an AMI ID, instance type, and key pair.
   Press Enter for the default `t2.micro` instance type. Optional security
   group and subnet IDs can be supplied; pressing Enter uses the default VPC
   settings where AWS permits it.
5. **List EC2 Instances** displays each instance ID, state, instance type, and
   public IP address in the configured region.
6. **Stop EC2 Instance** sends a stop request for the supplied instance ID.
7. **Terminate EC2 Instance** asks for `yes` confirmation before sending the
   termination request.
8. **Exit** closes the application.

## Example terminal output

```text
========================================
       AWS RESOURCE MANAGER
========================================

1. Create S3 Bucket
2. Upload File to S3
3. List S3 Buckets
4. Launch EC2 Instance
5. List EC2 Instances
6. Stop EC2 Instance
7. Terminate EC2 Instance
8. Exit

Enter your choice: 4
Enter AMI ID: ami-xxxxxxxx
Enter instance type (press Enter for t2.micro):
Enter key pair name: my-key-pair
EC2 instance launched successfully.
Instance ID: i-xxxxxxxx
```

## Important AWS cost warning

AWS resources can create charges. S3 storage and requests may cost money, and
running EC2 instances can incur hourly charges. Check the current AWS pricing
for your region before using the program.

Stop EC2 instances when you are temporarily finished with them. Terminate
instances and delete test S3 buckets and their objects when you no longer need
them. Stopping an instance may not stop charges for every attached resource,
such as EBS volumes or Elastic IP addresses, so review your AWS resources and
billing dashboard.
