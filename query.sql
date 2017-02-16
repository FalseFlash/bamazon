DROP PROCEDURE IF EXISTS tmp_drop_foreign_key;

DELIMITER $$

CREATE PROCEDURE tmp_drop_foreign_key(IN tableName VARCHAR(64), IN constraintName VARCHAR(64))
BEGIN
    IF EXISTS(
        SELECT * FROM information_schema.table_constraints
        WHERE
            table_schema    = DATABASE()     AND
            table_name      = tableName      AND
            constraint_name = constraintName AND
            constraint_type = 'FOREIGN KEY')
    THEN
        SET @query = CONCAT('ALTER TABLE ', tableName, ' DROP FOREIGN KEY ', constraintName, ';');
        PREPARE stmt FROM @query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

CALL tmp_drop_foreign_key('sales', 'sales_ibfk_1');
CALL tmp_drop_foreign_key('products', 'products_ibfk_1');

DROP PROCEDURE tmp_drop_foreign_key;

DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS sales;

SELECT concat('Dropped old tables.') as '';

/*
-----------------------------------------------------------------------------------------
 */

CREATE TABLE departments (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY UNIQUE,
  department_name VARCHAR(32) NOT NULL ,
  over_head_cost int DEFAULT 100
);

CREATE TABLE products (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY UNIQUE,
  product_name VARCHAR(32) NOT NULL,
  department_id INT,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  price FLOAT NOT NULL ,
  stock_quantity INT DEFAULT 0
);

CREATE TABLE sales (
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY UNIQUE,
  product_id INT,
  FOREIGN KEY (product_id) REFERENCES products(id),
  quantity_purchased INT NOT NULL ,
  created_at TIMESTAMP
);

-- Mock departments
INSERT INTO departments (department_name, over_head_cost) VALUE ('Food', FLOOR(RAND() * 1000));
INSERT INTO departments (department_name, over_head_cost) VALUE ('Automotive', FLOOR(RAND() * 1000));
INSERT INTO departments (department_name, over_head_cost) VALUE ('Electronics', FLOOR(RAND() * 1000));

-- Category ID's
SET @food = (SELECT id FROM departments WHERE departments.department_name='Food' LIMIT 1);
SET @auto = (SELECT id FROM departments WHERE departments.department_name='Automotive' LIMIT 1);
SET @elect = (SELECT id FROM departments WHERE departments.department_name='Electronics' LIMIT 1);


-- Mock products
INSERT INTO products (id, product_name, department_id, price, stock_quantity) VALUES
  (1, 'iPhone', @elect, FLOOR(RAND() * 6000), FLOOR(RAND() * 200)),
  (2, 'Macbook Pro', @elect, FLOOR(RAND() * 6000), FLOOR(RAND() * 200)),
  (3, 'Everlasting Apple', @food, FLOOR(RAND() * 6000), FLOOR(RAND() * 200)),
  (4, 'Magical Peach', @food, FLOOR(RAND() * 6000), FLOOR(RAND() * 200)),
  (5, 'Seedless Apricot', @food, FLOOR(RAND() * 6000), FLOOR(RAND() * 200)),
  (6, 'Used 2013 Chevy Cruze', @auto, 11000, FLOOR(RAND() * 200)),
  (7, 'Golden Tailpipe', @auto, FLOOR(RAND() * 6000), FLOOR(RAND() * 200)),
  (8, 'Samsung galaxy Note 7', @elect, 399, FLOOR(RAND() * 200)),
  (9, 'Broken 4K TV', @elect, 50, FLOOR(RAND() * 200)),
  (10, 'Beefless Burgers', @food, 8.99, FLOOR(RAND() * 100));