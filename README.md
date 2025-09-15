Cost Manager Front-End
Introduction

The Cost Manager is a front-end application designed to help users manage their expenses. It allows users to add cost items, generate detailed reports, and visualize data through charts. The application utilizes IndexedDB for local data storage and supports multiple currencies.

Features

Add Cost Items: Users can add new cost items by specifying the amount, currency, category, and description. The date of each cost item is automatically recorded.

Generate Detailed Reports: Users can generate detailed reports for a specific month and year, in a selected currency.

Visualize Data:

Pie Chart: Displays total costs for a selected month and year, categorized by expense type.

Bar Chart: Shows total costs for each month in a selected year.

Currency Support: The application supports the following currencies:

USD (United States Dollar)

ILS (Israeli New Shekel)

GBP (British Pound)

EURO (Euro)

Currency Conversion: Users can select a URL to fetch exchange rates. The expected response format is:

{
  "USD": 1,
  "GBP": 1.8,
  "EURO": 0.7,
  "ILS": 3.4
}


The application uses this data to convert costs into the selected currency.

Database

The application uses IndexedDB as its local database. The database schema includes:

Object Store: costs

Key: Auto-incremented ID

Value: Object containing:

sum: Number

currency: String

category: String

description: String

date: Date (automatically set to the current date)

idb.js Library

The idb.js library provides methods to interact with the IndexedDB database. It includes the following functions:

openCostsDB(databaseName, databaseVersion): Opens or creates the database with the specified name and version.

addCost(cost): Adds a new cost item to the database. Returns a Promise that resolves to the added cost item.

getReport(year, month, currency): Retrieves a detailed report for the specified year, month, and currency. Returns a Promise that resolves to the report data.

Project Structure
cost-manager/
│
├─ public/
│   └─ idb.js            # IndexedDB utility script
│
├─ tests/
│   ├─ test1.html        # Test HTML file
│   └─ test1.js          # Test script
│
├─ src/                  # React / Vite source files (optional)
│
└─ README.md

How to Run the Project

Install Dependencies:

Ensure you have Node.js installed. Then, install the serve package globally:

npm install -g serve


Start the Local Server:

Navigate to the project directory and start the server:

serve .


Access the Application:

Open your browser and go to:

http://localhost:3000/tests/test1.html


The test results will appear both on the page and in the console.

Testing

The test1.js script serves as a simple test for the idb.js library. It performs the following actions:

Opens the IndexedDB database.

Adds two cost items: one for food (pizza) and one for transportation (fuel).

Logs success messages to the console and displays them on the page.

To run the test:

Open test1.html in a web browser.

Check the console for logs and the page for displayed messages.

Notes

The database is stored locally in the browser using IndexedDB. Data is not persisted across different browsers or devices.

The application does not require a server-side backend; all functionality is handled on the client side.

The idb.js library is designed to be compatible with both vanilla JavaScript and React applications.