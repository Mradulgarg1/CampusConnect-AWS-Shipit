# CampusConnect — 60–90 second demo script

**0–10 sec — Introduction**  
"Hi, this is CampusConnect, a student-powered campus issue reporting and tracking portal. It helps students report everyday campus problems and follow their progress."

**10–30 sec — Create a report**  
"Let's report a Wi-Fi issue. I'll add a short title, choose Wi-Fi & Internet, enter the location, describe the problem, and submit it. The report is now stored in the cloud."

**30–45 sec — Community feed**  
"Here it appears in the community feed. Students can search reports and filter them by Open, In Progress, or Resolved. The dashboard counters update from the live database."

**45–60 sec — Moderator update**  
"An authorized moderator can open the moderator tools, enter the private deployment key, and update a report's status. This keeps students informed about progress."

**60–80 sec — AWS implementation**  
"The frontend is hosted on AWS Amplify. Requests go through Amazon API Gateway to AWS Lambda, which validates the data and reads or writes reports in Amazon DynamoDB. AWS SAM defines and deploys the backend infrastructure."

**80–90 sec — Closing**  
"CampusConnect turns individual feedback into visible, trackable campus improvements. Thank you."

**Recording note:** Use fictional sample data only. Do not show the moderator key, AWS credentials, student IDs, or personal information in the recording.
