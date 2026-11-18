# CampusConnect

**A student-powered campus issue reporting and tracking portal** built for the AWS Shipit Challenge by Techfest, IIT Bombay.

CampusConnect gives students one place to report recurring campus issues (Wi-Fi, mess, library, hostel, classrooms and other facilities), see community reports, search/filter them, and track progress. Authorized moderators can update report status.

## Features

- Submit a campus issue with category, location, title and description.
- Browse the latest 100 reports and search/filter by status.
- See live counts for total, open and resolved reports.
- Moderator-only status updates (`Open`, `In Progress`, `Resolved`).
- Input validation and HTML escaping in the UI.
- Serverless AWS backend; no always-on server.

## AWS architecture

```text
Student browser
   |
   | HTTPS
   v
AWS Amplify Hosting (static frontend)
   |
   | HTTPS JSON requests
   v
Amazon API Gateway (HTTP API)
   |
   v
AWS Lambda (Python 3.12)
   |
   v
Amazon DynamoDB (CampusConnect-Issues table)
```

Services used: AWS Amplify Hosting, Amazon API Gateway, AWS Lambda, Amazon DynamoDB, AWS SAM / AWS CloudFormation, and IAM execution-role permissions.

## Repository layout

```text
CampusConnect/
├── index.html
├── styles.css
├── app.js
├── amplify.yml
├── template.yaml
├── backend/
│   └── app.py
├── requirements.txt
└── README.md
```

## Deploy the backend to AWS

### Prerequisites

- An AWS account with access to deploy CloudFormation, Lambda, API Gateway and DynamoDB resources.
- AWS CLI configured for the account and Region you intend to use.
- AWS SAM CLI installed.
- Python 3.12 installed.

### 1. Build

From the project root:

```bash
sam build
```

### 2. Deploy

```bash
sam deploy --guided
```

Suggested answers:
- Stack name: `campusconnect`
- AWS Region: choose a nearby supported Region, such as `ap-south-1`
- Confirm changes before deploy: `Y`
- Allow SAM to create IAM roles: `Y`
- Save arguments to configuration file: `Y`

When prompted for `AdminKey`, enter a private random value of at least 12 characters. Do not share it and do not put it in source code, GitHub, screenshots or the public frontend. SAM's `NoEcho` parameter prevents it from being displayed in normal CloudFormation parameter output, but treat the value as a secret.

At the end, copy the `ApiUrl` output.

### 3. Connect the frontend

Open `app.js` and replace:

```js
const API_BASE = "PASTE_YOUR_API_GATEWAY_URL_HERE";
```

with the exact `ApiUrl` output from deployment, without adding a trailing slash. Save and commit the change.

### 4. Publish the frontend with AWS Amplify Hosting

1. Push this repository to GitHub.
2. In the AWS Console, open **AWS Amplify** and choose **Create new app / Host web app**.
3. Connect GitHub and select this repository and branch.
4. Keep the detected `amplify.yml` build settings. This is a plain static frontend; no framework build is required.
5. Deploy. Amplify will provide a public HTTPS app URL.
6. Open the URL, submit a test report, refresh, and confirm that it appears in the feed.

The API and frontend are separate deployments. The `ApiUrl` must be set before publishing the frontend.

## Run locally

You can preview the frontend locally, but live data requires the deployed API URL.

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser after setting `API_BASE` in `app.js`.

To test the backend locally, use AWS SAM Local after installing SAM CLI:

```bash
sam build
sam local start-api
```

For a local API test, temporarily set `API_BASE` to `http://127.0.0.1:3000` in `app.js`. Local Lambda invocation still needs AWS credentials if it accesses a real DynamoDB table.

## Moderator workflow

1. Open the deployed app.
2. Select **Moderator tools**.
3. Enter the private `AdminKey` value used during deployment.
4. Choose a report status and click **Update**.

The moderator key is sent only in the request header to the API. This is a lightweight challenge-demo moderator gate, not a full identity-management system. For production use, replace it with Amazon Cognito authentication and role-based authorization, and consider rate limiting / abuse protection.

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/issues` | List up to 100 latest reports |
| POST | `/issues` | Create a report |
| PATCH | `/issues/{issueId}/status` | Update status (moderator key required) |

Example create request:

```json
{
  "title": "Wi-Fi drops in Block B",
  "category": "Wi-Fi & Internet",
  "location": "Block B, Floor 2",
  "description": "The connection disconnects repeatedly in the evening."
}
```

## Cost and security notes

- The DynamoDB table is configured with provisioned capacity of 1 read unit and 1 write unit, rather than on-demand billing. Confirm current Free Tier eligibility for your AWS account and Region before deploying.
- Lambda, API Gateway, DynamoDB, Amplify and data transfer can incur charges depending on account eligibility, usage, Region and current AWS pricing. **Free Tier does not mean unlimited or guaranteed zero-cost.** Set an AWS Budget / billing alert before deployment and monitor usage.
- This prototype allows public report creation and public reading. Do not submit names, phone numbers, student IDs, private complaints, passwords or other sensitive information.
- CORS is open for this demo. For a real campus deployment, restrict allowed origins to the deployed frontend domain and add abuse controls.
- Delete the CloudFormation stack when finished testing if you no longer need the backend. Also remove the Amplify app if it is no longer needed.

## Challenge submission checklist

- [ ] AWS Builder Center profile created; alias copied.
- [ ] Student verification completed through the official student-rewards flow.
- [ ] Backend deployed and `ApiUrl` connected in `app.js`.
- [ ] Frontend deployed and public HTTPS link tested.
- [ ] Test report submitted and moderator status update tested.
- [ ] GitHub repository README and project link are public and accessible.
- [ ] 60–90 second demo video recorded (recommended).
- [ ] Challenge submission form completed.
- [ ] Submission confirmation screenshot saved.

## Demo video outline (60–90 seconds)

1. **0–10 sec:** Introduce CampusConnect and the campus problem it addresses.
2. **10–30 sec:** Submit a sample Wi-Fi / mess / library report.
3. **30–45 sec:** Show the report appearing in the community feed and use search/status filters.
4. **45–60 sec:** Open moderator tools and update the report status.
5. **60–80 sec:** Explain the AWS architecture: Amplify → API Gateway → Lambda → DynamoDB.
6. **80–90 sec:** Show the live app URL and GitHub repository.

## Challenge details

Prepared for the AWS Shipit Challenge, organized by Techfest, IIT Bombay, in collaboration with AWS (17–27 November 2026). The challenge requires a functional campus-focused project built using AWS Free Tier. This repository is a project implementation; participant profile verification and the final submission must still be completed by the participant.
