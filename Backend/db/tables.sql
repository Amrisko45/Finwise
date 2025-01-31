CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    gender ENUM('Male', 'Female', 'Other') NOT NULL
);

CREATE TABLE IF NOT EXISTS Income_Source (
    source_id INT AUTO_INCREMENT PRIMARY KEY,
    source_name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Income (
    income_id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    frequency ENUM('One-Time', 'Daily', 'Weekly', 'Monthly', 'Yearly') NOT NULL DEFAULT 'One-Time',
    user_id INT,
    source_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES Income_Source(source_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Expense_Category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL
);
CREATE TABLE IF NOT EXISTS Expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    user_id INT,
    category_id INT,
    time TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Expense_Category(category_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Budget (
    budget_id INT AUTO_INCREMENT PRIMARY KEY,
    monthly_budget DECIMAL(10, 2) NOT NULL,
    last_defined_date DATE NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Financial_Goal (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    goal_amount DECIMAL(10, 2) NOT NULL,
    goal_deadline DATE NOT NULL,
    budget_id INT,
    user_id INT,
    description VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (budget_id) REFERENCES Budget(budget_id) ON DELETE CASCADE
);