import boto3
import time
from datetime import datetime

# ==============================
# CONFIGURATION
# ==============================

INSTANCE_ID = "i-006af5bb93ad1f728"
REGION = "ap-south-1"

WORK_TIME = 2 * 60 * 60  # 2 hours


# ==============================
# EC2 CLIENT
# ==============================

ec2 = boto3.client(
    "ec2",
    region_name=REGION
)


# ==============================
# LOGGING FUNCTION
# ==============================

def log(message):
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{current_time}] {message}")


# ==============================
# GET INSTANCE STATE
# ==============================

def get_instance_state():
    response = ec2.describe_instances(
        InstanceIds=[INSTANCE_ID]
    )

    state = response["Reservations"][0]["Instances"][0]["State"]

    return state["Name"]


# ==============================
# START INSTANCE
# ==============================

def start_instance():

    state = get_instance_state()

    log(f"Current instance state: {state}")

    if state == "running":
        log("Instance is already RUNNING.")

    elif state == "stopped":

        log("Instance is STOPPED.")
        log("Starting EC2 instance...")

        ec2.start_instances(
            InstanceIds=[INSTANCE_ID]
        )

        log("Start request sent.")

        while True:

            state = get_instance_state()

            log(f"Current state: {state}")

            if state == "running":
                log("Instance is now RUNNING.")
                break

            elif state == "pending":
                log("Instance is starting...")

            time.sleep(10)

    elif state == "pending":

        log("Instance is already STARTING.")

        while True:

            state = get_instance_state()

            log(f"Current state: {state}")

            if state == "running":
                log("Instance is now RUNNING.")
                break

            time.sleep(10)

    else:

        log(f"Unexpected instance state: {state}")


# ==============================
# STOP INSTANCE
# ==============================

def stop_instance():

    state = get_instance_state()

    log(f"Instance state before stopping: {state}")

    if state == "running":

        log("Stopping EC2 instance...")

        ec2.stop_instances(
            InstanceIds=[INSTANCE_ID]
        )

        log("Stop request sent.")

        while True:

            state = get_instance_state()

            log(f"Current state: {state}")

            if state == "stopped":
                log("Instance is now STOPPED.")
                break

            elif state == "stopping":
                log("Instance is stopping...")

            time.sleep(10)

    else:

        log(f"Instance is not running. Current state: {state}")


# ==============================
# MAIN
# ==============================

def main():

    log("=" * 50)
    log("EC2 AUTOMATION STARTED")
    log("=" * 50)

    # Step 1: Make sure instance is running
    start_instance()

    # Step 2: Work for 2 hours
    log("EC2 instance is RUNNING.")
    log("Starting 2-hour work timer...")

    start_time = time.time()

    while time.time() - start_time < WORK_TIME:

        elapsed = int(time.time() - start_time)
        remaining = WORK_TIME - elapsed

        hours = remaining // 3600
        minutes = (remaining % 3600) // 60
        seconds = remaining % 60

        log(
            f"Remaining work time: "
            f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        )

        time.sleep(60)

    # Step 3: Stop after 2 hours
    log("2 hours completed.")

    stop_instance()

    log("=" * 50)
    log("EC2 AUTOMATION COMPLETED")
    log("=" * 50)


if __name__ == "__main__":
    main()