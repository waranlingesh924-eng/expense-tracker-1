# 💰 Expense Tracker

A basic web-based Expense Tracker application built using **TypeScript, Vite, Bun, HTML, CSS, and JSON**.

The application helps users manage daily expenses, track spending, and maintain expense records.

---

## 📌 Project Overview

The Expense Tracker is designed to simplify personal expense management.

Users can add, view, edit, and delete expense records. The application provides an organized interface for tracking expenses.

This project is suitable for learning web development, CRUD operations, and frontend-backend integration.

---

## 🎯 Project Objectives

- Manage daily expenses.
- Add and maintain expense records.
- View expense history.
- Track total spending.
- Categorize expenses.
- Store expense information.
- Provide a simple and user-friendly interface.

---

## 🚀 Features

### 1. Expense Management

- Add new expenses.
- View expense records.
- Edit existing expenses.
- Delete expenses.
- Track expense details.

### 2. Expense Categories

- Food
- Travel
- Shopping
- Bills
- Education
- Other

### 3. Dashboard

- Display expense information.
- View expense history.
- Track total spending.
- Provide an organized user interface.

### 4. Database

- Store expense information.
- Use JSON-based data storage if supported by the implementation.
- Manage expense records.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| TypeScript | Programming language |
| Vite | Frontend development and build tool |
| Bun | Runtime and package manager |
| HTML | Web page structure |
| CSS | Styling and user interface |
| JSON | Data storage |
| JavaScript | Application functionality |

---

## 📂 Project Structure

```text
expense-tracker/
│
├── .env.example
├── .gitignore
├── README.md
├── bun.lock
├── fin_database.json
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

---

# ⚙️ Installation and Setup

## Step 1: Install Required Software

Install the following software:

- Visual Studio Code
- Bun
- Web Browser

### Install Bun

Download Bun from:

https://bun.sh

Check whether Bun is installed:

```bash
bun --version
```

If the installation is successful, the terminal will display the Bun version.

---

## Step 2: Open the Project in VS Code

1. Open Visual Studio Code.
2. Click **File → Open Folder**.
3. Select the Expense Tracker project folder.
4. Open the integrated terminal.

### Open Terminal Shortcut

```text
Ctrl + `
```

You can also open the terminal using:

```text
Terminal → New Terminal
```

---

## Step 3: Navigate to the Project Folder

If you are not already inside the project folder, run:

```bash
cd expense-tracker
```

Make sure the terminal is located in the folder containing `package.json`.

---

## Step 4: Install Dependencies

Run the following command:

```bash
bun install
```

This installs the dependencies listed in `package.json`.

Wait until the installation is complete.

---

## Step 5: Check package.json

Open the `package.json` file.

Check the available scripts.

Example:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Note:** Your actual scripts may be different. Always check your own `package.json`.

To display available scripts, run:

```bash
bun run
```

---

# ▶️ How to Run the Application

## Step 6: Start the Frontend

Run the development server:

```bash
bun run dev
```

The terminal will display a local URL similar to:

```text
http://localhost:5173
```

Open the URL in your browser.

Your Expense Tracker frontend should now be available.

---

## Step 7: Open the Application

Open your web browser and visit:

```text
http://localhost:5173
```

The application should display the Expense Tracker interface.

**Note:** The exact URL and port are shown in the terminal when Vite starts.

---

# 🖥️ Backend Setup

The project contains a backend file:

```text
server.ts
```

The exact backend startup command depends on how `server.ts` is implemented.

### If server.ts is a standalone Bun server

Open a second VS Code terminal and run:

```bash
bun run server.ts
```

### If a backend script exists in package.json

Use the corresponding script:

```bash
bun run <backend-script>
```

For example:

```bash
bun run server
```

**Important:** Do not assume the backend command without checking `package.json`.

---

# 🔄 Running Frontend and Backend Together

If your project requires separate frontend and backend servers:

### Terminal 1: Frontend

```bash
bun run dev
```

### Terminal 2: Backend

```bash
bun run server.ts
```

Keep both terminals running.

The frontend and backend must be configured to communicate with each other.

---

# 🗄️ Database

The project contains the following database file:

```text
fin_database.json
```

This file may be used to store expense-related information.

The exact database structure depends on the implementation of the application.

### Example Expense Data

```json
[
  {
    "id": 1,
    "title": "Lunch",
    "amount": 150,
    "category": "Food",
    "date": "2026-09-17"
  }
]
```

**Note:** The example data structure must match the format expected by your application.

---

# 🔄 Application Workflow

```text
Start Application
       │
       ▼
    Dashboard
       │
       ▼
   Add Expense
       │
       ▼
Enter Expense Details
       │
       ▼
   Save Expense
       │
       ▼
     Database
       │
       ▼
 View Expense History
       │
       ├── Edit Expense
       │
       └── Delete Expense
```

---

# 🧪 Testing

Test the following functionalities:

- [ ] Application starts successfully.
- [ ] Dashboard loads correctly.
- [ ] Add expense works.
- [ ] View expense records.
- [ ] Edit expense works.
- [ ] Delete expense works.
- [ ] Expense data is stored correctly.
- [ ] Expense categories work.
- [ ] Application works on different screen sizes.

---

# 🛠️ Available Commands

## Install Dependencies

```bash
bun install
```

## Start Development Server

```bash
bun run dev
```

## Build the Project

```bash
bun run build
```

## Preview Production Build

```bash
bun run preview
```

## Display Available Scripts

```bash
bun run
```

---

# 🔧 Troubleshooting

## Problem 1: Bun Not Found

### Solution

Install Bun from:

https://bun.sh

Restart VS Code and check:

```bash
bun --version
```

---

## Problem 2: Dependencies Not Installed

### Solution

Run:

```bash
bun install
```

---

## Problem 3: Application Does Not Start

### Solution

Check the available scripts:

```bash
bun run
```

Verify the `package.json` file and run the appropriate command.

---

## Problem 4: Port Already in Use

### Solution

Stop the existing development server.

Then run:

```bash
bun run dev
```

If the port is still occupied, check the terminal error and configure an available port.

---

## Problem 5: Backend Does Not Start

### Solution

Check:

1. The contents of `server.ts`.
2. The scripts in `package.json`.
3. Required backend dependencies.
4. Any error messages in the terminal.

Run the correct backend command based on your project configuration.

---

# 📈 Expected Output

The Expense Tracker application should provide an interface for:

- Viewing expenses.
- Adding expenses.
- Editing expenses.
- Deleting expenses.
- Tracking spending.
- Managing expense records.

The exact available functionality depends on the implemented source code.

---

# 🔮 Future Enhancements

- User registration and login.
- Income management.
- Monthly budget tracking.
- Expense charts and graphs.
- Export reports to PDF.
- Export data to Excel.
- Category-wise expense analysis.
- Monthly expense summaries.
- Responsive mobile interface.
- Advanced financial analytics.

---

# 🔐 Security Considerations

- Validate user input.
- Use secure data handling.
- Protect sensitive environment variables.
- Use parameterized queries when working with SQL databases.
- Disable debug mode in production.
- Implement appropriate authentication if user accounts are added.

---

# 📌 Conclusion

The Expense Tracker is a web application designed to help users manage their daily expenses.

The project demonstrates frontend development using TypeScript and Vite, package management with Bun, and expense data storage.

It can be extended with additional features such as income tracking, budgeting, reporting, and financial analytics.

---

# 👨‍💻 Author

Your Name Lingeshwaran K

---

# 📄 License

This project is created for educational purposes.

---

# ⚡ Quick Start

Open the VS Code terminal and run:

```bash
bun install
bun run dev
```

Open the local URL displayed in the terminal.

---

## ✅ Project Checklist

- [ ] Install Bun.
- [ ] Open project in VS Code.
- [ ] Open VS Code terminal.
- [ ] Run `bun install`.
- [ ] Check `package.json`.
- [ ] Run `bun run dev`.
- [ ] Open the local browser URL.
- [ ] Test the Expense Tracker application.
