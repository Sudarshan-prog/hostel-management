# MySQL Database Setup Instructions

This project has been migrated from an embedded H2 database to **MySQL**. Because MySQL runs locally as a background service, you need to configure your local MySQL server before starting the Spring Boot backend.

Follow these simple steps:

## 1. Install MySQL
If you haven't already, install [MySQL Server](https://dev.mysql.com/downloads/installer/) on your machine. During installation, you will be prompted to set a `root` password. Remember this password!

## 2. Create the Database
Open your MySQL Command Line Client or MySQL Workbench and run the following SQL command to create a blank database for this project:

```sql
CREATE DATABASE hostel_db;
```

*(You don't need to create any tables! Hibernate will automatically create all the necessary tables for you when you start the Spring Boot app).*

## 3. Update application.properties
Open the project in your IDE and navigate to the backend configuration file:
`backend/src/main/resources/application.properties`

At the top of the file, you will find the MySQL configuration block:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hostel_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=your_mysql_password_here
```

- If your MySQL username is different from `root`, update the `spring.datasource.username` field.
- Change `your_mysql_password_here` to the actual password you set when installing MySQL.

## 4. Run the Backend
You're all set! Run the backend Spring Boot application:

```bash
cd backend
mvn spring-boot:run
```

Hibernate will connect to your MySQL database, automatically construct the required tables (`building`, `floor`, `room`, `bed`, `student`, `complaint`), and launch the API at `http://localhost:8080`.

---
**Note:** If you ever want to switch back to the file-based H2 database (for testing on a computer without MySQL), simply comment out the MySQL block in `application.properties` and uncomment the `Legacy H2 Configuration` block at the bottom of the file!
