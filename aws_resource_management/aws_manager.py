"""A simple command-line AWS resource manager for beginners."""

import os

import boto3


def get_aws_region():
    """Return the configured AWS region or raise a helpful error."""
    region = boto3.Session().region_name
    if not region:
        raise ValueError(
            "No AWS region is configured. Run 'aws configure' and set a default region."
        )
    return region


def create_s3_bucket():
    try:
        bucket_name = input("Enter bucket name: ").strip()
        if not bucket_name:
            print("Bucket name cannot be empty.")
            return

        region = get_aws_region()
        s3 = boto3.client("s3", region_name=region)
        create_args = {"Bucket": bucket_name}

        # us-east-1 uses the S3 API's default location constraint.
        if region != "us-east-1":
            create_args["CreateBucketConfiguration"] = {
                "LocationConstraint": region
            }

        s3.create_bucket(**create_args)
        print("S3 bucket created successfully.")
    except Exception as error:
        print(f"Could not create the S3 bucket: {error}")


def upload_file_to_s3():
    try:
        bucket_name = input("Enter bucket name: ").strip()
        file_path = input("Enter local file path: ").strip()

        if not bucket_name or not file_path:
            print("Bucket name and file path are required.")
            return
        if not os.path.isfile(file_path):
            print(f"File not found: {file_path}")
            return

        s3 = boto3.client("s3", region_name=get_aws_region())
        object_name = os.path.basename(file_path)
        s3.upload_file(file_path, bucket_name, object_name)
        print(f"File uploaded successfully as '{object_name}'.")
    except Exception as error:
        print(f"Could not upload the file: {error}")


def list_s3_buckets():
    try:
        s3 = boto3.client("s3", region_name=get_aws_region())
        response = s3.list_buckets()
        buckets = response.get("Buckets", [])

        print("\nS3 Buckets:")
        if not buckets:
            print("- No buckets found.")
        for bucket in buckets:
            print(f"- {bucket['Name']}")
    except Exception as error:
        print(f"Could not list S3 buckets: {error}")


def launch_ec2_instance():
    try:
        ami_id = input("Enter AMI ID: ").strip()
        instance_type = input("Enter instance type (press Enter for t2.micro): ").strip()
        key_name = input("Enter key pair name: ").strip()

        if not ami_id or not key_name:
            print("AMI ID and key pair name are required.")
            return
        instance_type = instance_type or "t2.micro"

        print(
            "Optional settings (press Enter to use the default VPC/security group):"
        )
        security_group_id = input("Enter security group ID: ").strip()
        subnet_id = input("Enter subnet ID: ").strip()

        ec2 = boto3.client("ec2", region_name=get_aws_region())
        launch_args = {
            "ImageId": ami_id,
            "InstanceType": instance_type,
            "KeyName": key_name,
            "MinCount": 1,
            "MaxCount": 1,
        }
        if security_group_id:
            launch_args["SecurityGroupIds"] = [security_group_id]
        if subnet_id:
            launch_args["SubnetId"] = subnet_id

        response = ec2.run_instances(**launch_args)
        instance_id = response["Instances"][0]["InstanceId"]
        print("EC2 instance launched successfully.")
        print(f"Instance ID: {instance_id}")
    except Exception as error:
        print(f"Could not launch the EC2 instance: {error}")


def list_ec2_instances():
    try:
        ec2 = boto3.client("ec2", region_name=get_aws_region())
        response = ec2.describe_instances()

        print("\nInstance ID\tState\tInstance Type\tPublic IP")
        found_instance = False
        for reservation in response.get("Reservations", []):
            for instance in reservation.get("Instances", []):
                found_instance = True
                public_ip = instance.get("PublicIpAddress", "None")
                state = instance.get("State", {}).get("Name", "Unknown")
                print(
                    f"{instance.get('InstanceId', 'Unknown')}\t"
                    f"{state}\t"
                    f"{instance.get('InstanceType', 'Unknown')}\t"
                    f"{public_ip}"
                )

        if not found_instance:
            print("No EC2 instances found.")
    except Exception as error:
        print(f"Could not list EC2 instances: {error}")


def stop_ec2_instance():
    try:
        instance_id = input("Enter EC2 Instance ID: ").strip()
        if not instance_id:
            print("Instance ID cannot be empty.")
            return

        ec2 = boto3.client("ec2", region_name=get_aws_region())
        ec2.stop_instances(InstanceIds=[instance_id])
        print(f"Stop request sent for instance {instance_id}.")
    except Exception as error:
        print(f"Could not stop the EC2 instance: {error}")


def terminate_ec2_instance():
    try:
        instance_id = input("Enter EC2 Instance ID: ").strip()
        if not instance_id:
            print("Instance ID cannot be empty.")
            return

        confirmation = input(
            "Are you sure you want to terminate this instance? (yes/no): "
        ).strip().lower()
        if confirmation != "yes":
            print("Termination cancelled.")
            return

        ec2 = boto3.client("ec2", region_name=get_aws_region())
        ec2.terminate_instances(InstanceIds=[instance_id])
        print(f"Termination request sent for instance {instance_id}.")
    except Exception as error:
        print(f"Could not terminate the EC2 instance: {error}")


def show_menu():
    print(
        """
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
"""
    )


def main():
    while True:
        show_menu()
        choice = input("Enter your choice: ").strip()

        if choice == "1":
            create_s3_bucket()
        elif choice == "2":
            upload_file_to_s3()
        elif choice == "3":
            list_s3_buckets()
        elif choice == "4":
            launch_ec2_instance()
        elif choice == "5":
            list_ec2_instances()
        elif choice == "6":
            stop_ec2_instance()
        elif choice == "7":
            terminate_ec2_instance()
        elif choice == "8":
            print("Thank you for using AWS Resource Manager.")
            break
        else:
            print("Invalid choice. Please enter a number from 1 to 8.")


if __name__ == "__main__":
    main()
