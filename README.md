# Hostel Management Frontend
---

## Requirements & Features

### 1. Student Registration & Housing Application✅
- **Register / Login**  
  - Students sign up (name, email, password) → JWT stored in `localStorage`  
  - Login with email/password → redirected to Student Dashboard  
- **Apply for Housing**  
  - “Available Rooms” shown as scrollable cards  
  - Click **Apply** → prompt for free‐form “preference” (e.g. “near window”)  
  - Creates an application record with `room_id` + `preference`  

### 2. Room Listings & Availability ✅
- **Display Hostels & Rooms**  
  - `/api/hostels` → list of hostel names + descriptions  
  - `/api/rooms/available` → rooms with `occupancy < capacity`  
- **Photos & Descriptions**  
  - Each room‐card shows an image (from `/images/…`) and a short description  
  - there is a Responsive grid   

### 3. Application Processing & Notification ✅
- **Admin Review**  
  - `/api/applications` → all student submissions with status  
  - there are  **Accept** / **Reject** buttons in one filterable table  

- **Notifications**  
  - On status change → student gets a dashboard notification badge  
  - Student “Notifications” card shows latest + “View All” toggle  

### 4. Allotment & Room Management ✅
- **View Assigned Rooms**  
  - Student Dashboard → “Your Assigned Room” panel updates on acceptance  
- **Manage Rooms**  
  - the Admin can “Create Room” form (choose image from a preset list)  
  - Edit room number & capacity via modal; status auto‐updates when full  
  - Delete rooms (fails if capacity/occupancy mismatch)  
- **Allotted Students**  
  - Admin panel “Allotted Students” shows who’s in which room  

-----

----🛠 How to Operate-----

---for Student Workflow----

1-Register via register.html → auto-login

2-Browse Rooms on student.html

3-Click Apply → enter preference → see confirmation

4-Notifications card shows “pending”

5-After Admin decision → notification updates & “Your Assigned Room” shows


-----the Admin Workflow-----

-Login with the only admin username and password (username-admin@yourdomain.com///password-MySecretAdminPass)

Create Room: fill hostel_id, room_number, capacity, select from image dropdown, description

To view Applications:

Use filter buttons [All, Pending, Accepted, Rejected]

✔️ / ✖️ to accept/reject

also the allotted Students panel updates automatically

Edit Room: click “Edit” → modal popup → change number or capacity

Delete Room: click “Delete” (only if no conflicting occupancy)


-----How to run locally-----

##---how to start the backend----

--since you have acces to the github repo
1-clone and install with the following
-git clone <Hostel-management-Backend>
-npm install

2-configure your database (postgres)
you can create the tables with the sql code.txt in the repo
-ensure server name is hostel_management
you can check .env for the url

3-to start the server- npm run dev  


##---how to start the frontend----
1-clone and install //in a separate terminal where the frontend is: 
npm install -g http-server      # if you don’t already have it
http-server . -p 8080

---in app.js its already set to
const API_BASE = 'http://localhost:5000/api';

after running: http-server . -p 8080 you would see to servers select the second one 
( http://127.0.0.1:8080)

and everything should work, hopefully.

---------------------------



-----Readings & Resources utilized i used  -----

Express and CORS -  https://expressjs.com/en/resources/middleware/cors.html

JWT Authentication - https://jwt.io/introduction

how to an Fetch API - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

Multer File Uploads - https://github.com/expressjs/multer '// i wanted to allow you to update images from your local computer but it was too complex for me 

Responsive Tables to Cards - https://css-tricks.com/responsive-data-tables/




the various Challenges & Solutions

Problem///////////////Solution
CORS errors---------------------Added app.use(cors())
Missing JWT---------------------after register Return token in /auth/register response
Static /uploads 404 for images---app.use('/uploads', express.static(...))
Modal edit before DOM ready------Wrapped in DOMContentLoaded
Duplicate notification items on “View All”---------Maintain _showingAll state + renderNotifications()

