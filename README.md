# SalesFlow CRM

A simple full-stack Customer Relationship Management (CRM) application for managing customer records.

## Features

- Add, view, update and delete customers
- Search customers by name
- Filter customers by status
- Dashboard with customer statistics
- REST API based frontend-backend communication
- MySQL database persistence

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.3.2, Spring Data JPA, Hibernate
- **Frontend:** HTML, CSS, JavaScript
- **Database:** MySQL 8
- **Build Tool:** Maven


## Requirements

- Java 17
- Maven
- MySQL 8

## Database Setup

Create the database in MySQL:

```sql
CREATE DATABASE salesflow_crm;
```

Configure the database in:

```text
backend/src/main/resources/application.properties
```

Default configuration:

```properties
DB_HOST=localhost
DB_PORT=3306
DB_NAME=salesflow_crm
DB_USER=root
DB_PASSWORD=root
```

Change the password according to your MySQL installation.

> **Security:** Do not commit your real database password to GitHub. Use environment variables for production.

## Run the Backend

Start MySQL first, then open a terminal in the backend directory:

```powershell
cd backend
mvn spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

## Run the Frontend

Open the `frontend` folder and run `index.html` using VS Code Live Server or another local web server.

The frontend communicates with:

```text
http://localhost:8080/api/customers
```

## REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/{id}` | Get customer by ID |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Delete customer |
| GET | `/api/customers/search?name={name}` | Search customers by name |


## How It Works

```text
Frontend (HTML/CSS/JavaScript)
              ↓
          REST API
              ↓
         Spring Boot
              ↓
   Spring Data JPA / Hibernate
              ↓
            MySQL
```

Hibernate automatically creates or updates the `customers` table using:

```properties
spring.jpa.hibernate.ddl-auto=update
```
