# TrueFit Django Backend

This is the fully functioning Django backend for the TrueFit store, configured with MySQL and Django REST Framework.

## Prerequisites

- **Python 3.10+** installed
- **MySQL/MariaDB** server installed and running
- **pip** package installer

## Setup Instructions

### 1. Database Creation
Create the MySQL database and the user (if using a different user than root).
Run these commands in your MySQL shell (`mysql -u root -p`):
```sql
CREATE DATABASE truefit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'truefit_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON truefit_db.* TO 'truefit_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Virtual Environment
Clone the project or navigate to this directory, then create a virtual environment:
```bash
cd truefit_backend
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Requirements
```bash
pip install -r requirements.txt
```

### 4. Environment Variables
Copy the example environment file and configure it:
```bash
cp .env.example .env
```
Open `.env` and fill in your actual database credentials (`DB_PASSWORD`, etc.)

### 5. Run Migrations
Generate the database tables:
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create SuperUser
Create an admin account to access the Django admin panel:
```bash
python manage.py createsuperuser
```

### 7. Run the Server
```bash
python manage.py runserver
```

## Using the Project

**Admin Panel:**
Go to [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin) and log in with your superuser credentials. Here, you can add, edit, or delete `Product` variations.

**Storefront API:**
The read-only API endpoint for your products is available at [http://127.0.0.1:8000/api/products/](http://127.0.0.1:8000/api/products/). 
It returns paginated JSON results.
