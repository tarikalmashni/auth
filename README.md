# Authentication API with AWS Lambda and DynamoDB

This project implements an authentication API using AWS Lambda and DynamoDB.
It provides endpoints to add a new user as well as validate an existing user.

## Table of Contents
- [Overview](#overview)
- [Setup](#setup)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

The API allows for:
1. Adding new credentials to DynamoDB with hashed passwords.
2. Validating credentials against the stored data.

## Setup

### Prerequisites
- [Terraform](https://www.terraform.io/downloads.html) installed
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) installed and configured
- [Node.js](https://nodejs.org/) installed
- An AWS account

### Configuration

1. Clone the repository:
    ```bash
    git clone https://github.com/tarikalmashni/auth
    cd auth
    ```

2. Configure AWS CLI:
    ```bash
    aws configure
    ```

3. Update `terraform` variables if needed in `main.tf`.

## Deployment

### 1. Zip the Lambda function code

Ensure that the latest version of `index.js` is zipped alongside the node modules:
```bash
zip -r function.zip index.js node_modules/
```
In case you make any changes to the index.js you have to zip it again, then run this command to upload the new version:
```bash
aws lambda update-function-code --function-name AuthFunction --zip-file fileb://function.zip
```

### 2. Apply Terraform configuration
```bash
terraform init
terraform plan
terraform apply
```

## API Documentation

Use the URL provided at the end of the terraform apply command from the previous step along with the POST method and a body like this:
```bash
{
  "username": "exampleuser",
  "password": "examplepassword",
  "action": "add",
  "masterpassword": "i_am_a_masterpassword"
}
```
Change the action from "add" to "validate" to check whether the given credentials exist in the database and are correct.
Possible responses can be found in the index.js as well as the api/openapi.yaml files within this project.
To keep things simple, a master password is used which as of now is a hardcoded string within the index.js.

The API is specified using openapi 3.0.0 and the openapi.yaml can be found in the api subdirectory.

## Troubleshooting

- Forbidden Error: Ensure the API Gateway stage is deployed