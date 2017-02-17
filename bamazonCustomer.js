'use strict';

import * as fs from 'fs';
import * as mysql from 'mysql';
import * as prompt from 'prompt'
import Table from 'cli-table';
import formatCurrency from 'format-currency';

// Check to see if we have a password file. Make one if we don't.
if (!fs.existsSync('./password.js')) {
    fs.writeFileSync('./password.js', "exports.password = '';");
}

// SQL requires and password, so here we have a private file.
import password from './password';

// An object list to hold the items.

// Setup the CLI table.
let list = new Table({
    head: ['ID', 'Product', 'Price', 'Stock']
});

const sql = new mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: password.password,
    database: 'bamazon_db'
});

sql.connect((err) => {
    if (err) throw err;

    console.log('Connected!');
});

sql.query('SELECT * FROM products;', (err, results, fields) => {
    if (err) throw err;

    results.forEach((data) => {
        let id = data.id;
        let name = data.product_name;
        let price = data.price;
        let stock = data.stock_quantity;

        list.push([
            id, name, formatCurrency(price, {
                symbol: '$',
                code: 'USD',
                format: '%s%v'
            }), (stock <= 0) ? 'Out of Stock' : stock
        ])
    });

    console.log(list.toString());

    purchase();
});

const purchase = () => {
    let info = {
        properties: {
            ID: {
                description: 'Enter the Item ID you wish to purchase '
            },
            quantity: {
                description: 'How many do you wish to purchase? '
            }
        }
    };

    prompt.start();

    prompt.get(info, (err, res) => {
        let bought = {
            ID: res.ID,
            quantity: res.quantity,
            stock: 0
        };

        sql.query(`SELECT id, stock_quantity, product_name FROM products WHERE id=? LIMIT 1`, bought.ID, (err, results, fields) => {
            let data = results[0];

            const stock = parseInt(data.stock_quantity);
            bought.stock = stock;

            if ((bought.quantity > stock) || (stock <= 0)) {
                prompt.stop();
                return console.log(`Insufficient quantity! Not enough in stock to purchase ${bought.quantity}`);
            }

            let math = parseInt(bought.stock) - parseInt(bought.quantity);

            sql.query("UPDATE products SET stock_quantity=" + math + " WHERE id=" + bought.ID);
            sql.query("INSERT INTO sales (product_id, quantity_purchased) VALUE (" + bought.ID + ", " + bought.quantity + ")");
            console.log("Purchase successful!");
            prompt.stop();
            sql.end();
        }); // End SQL stock query

    }); // End prompt get
};