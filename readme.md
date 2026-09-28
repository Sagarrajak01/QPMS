# Question Paper Management System (QPMS)

OPMS is full-stack application designed for educational institutions to streamline the creation and management of examination papers.

The system allows administrators to manage faculty and subjects, while enabling faculty members to build question banks and automatically generate randomized question papers with multiple sets based on a custom blueprint.

## Key Features

* **Role-Based Access Control:** Distinct portals for **Admin** and **Faculty**.
* **Automated Paper Generation:** Generate papers dynamically based on a customizable blueprint containing question types, marks, and question counts.
* **Multiple Sets:** Automatically generate randomized **Set A, Set B, and Set C** from the question bank.
* **PDF Export:** Print-ready, cleanly formatted PDF export with page breaks and hidden UI elements.
* **Bulk CSV Uploads:** Instantly populate the system with faculty members or questions using CSV files.
* **Modern UI/UX:** Fully responsive design for mobile and desktop with a seamless Dark/Light mode toggle.
* **Secure Authentication:** JWT-based authentication with Bcrypt password hashing.

## Tech Stack

* **Frontend:** React.js (Vite), Tailwind CSS, React Router, Papaparse, Lucide React
* **Backend:** Node.js, Express.js
* **Database:** MongoDB with Mongoose
* **Authentication:** JSON Web Tokens (JWT)
* **Password Security:** Bcrypt

## Installation & Setup

### Prerequisites

* Node.js installed on your machine
* MongoDB running locally or a MongoDB Atlas URI

### 1. Backend Setup

Open a terminal and navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/qpms
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

Seed the default Admin account:

```bash
node src/utils/seedAdmin.js
```

Start the backend server:

```bash
npm run dev
```

### 2. Frontend Setup

Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

Open your browser and go to:

```text
http://localhost:3000
```

Or use the port provided by Vite.

---

## Default Credentials

After running the `seedAdmin.js` script, you can log in using the following default administrator credentials:

* **Email:** `admin@college.edu`
* **Password:** `admin123`

---

## CSV Upload Formats

When using the **Bulk Upload** feature, ensure that your CSV files contain the following exact headers. Headers are **case-sensitive**.

### Admin — Faculty Upload CSV

```text
name, email, password, employeeId, department, phone
```

### Faculty — Question Bank Upload CSV

```text
type, questionText, marks, difficulty, unit, optionA, optionB, optionC, optionD, correctAnswer, acceptedAnswers
```

### Valid Question Types

* `MCQ`
* `ONE_WORD`
* `SUBJECTIVE`
