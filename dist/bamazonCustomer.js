'use strict';

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _mysql = require('mysql');

var mysql = _interopRequireWildcard(_mysql);

var _prompt = require('prompt');

var prompt = _interopRequireWildcard(_prompt);

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _formatCurrency = require('format-currency');

var _formatCurrency2 = _interopRequireDefault(_formatCurrency);

var _password = require('./password');

var _password2 = _interopRequireDefault(_password);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Check to see if we have a password file. Make one if we don't.
if (!fs.existsSync('./password.js')) {
    fs.writeFileSync('./password.js', "exports.password = '';");
}

// SQL requires and password, so here we have a private file.


// An object list to hold the items.

// Setup the CLI table.
var list = new _cliTable2.default({
    head: ['ID', 'Product', 'Price', 'Stock']
});

var sql = new mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: _password2.default.password,
    database: 'bamazon_db'
});

sql.connect(function (err) {
    if (err) throw err;

    console.log('Connected!');
});

sql.query('SELECT * FROM products;', function (err, results, fields) {
    if (err) throw err;

    results.forEach(function (data) {
        var id = data.id;
        var name = data.product_name;
        var price = data.price;
        var stock = data.stock_quantity;

        list.push([id, name, (0, _formatCurrency2.default)(price, {
            symbol: '$',
            code: 'USD',
            format: '%s%v'
        }), stock <= 0 ? 'Out of Stock' : stock]);
    });

    console.log(list.toString());

    purchase();
});

var purchase = function purchase() {
    var info = {
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

    prompt.get(info, function (err, res) {
        var bought = {
            ID: res.ID,
            quantity: res.quantity,
            stock: 0
        };

        sql.query('SELECT id, stock_quantity, product_name FROM products WHERE id=? LIMIT 1', bought.ID, function (err, results, fields) {
            var data = results[0];

            var stock = parseInt(data.stock_quantity);
            bought.stock = stock;

            if (bought.quantity > stock || stock <= 0) {
                prompt.stop();
                return console.log('Insufficient quantity! Not enough in stock to purchase ' + bought.quantity);
            }

            var math = parseInt(bought.stock) - parseInt(bought.quantity);

            sql.query("UPDATE products SET stock_quantity=" + math + " WHERE id=" + bought.ID);
            sql.query("INSERT INTO sales (product_id, quantity_purchased) VALUE (" + bought.ID + ", " + bought.quantity + ")");
            console.log("Purchase successful!");
            prompt.stop();
            sql.end();
        }); // End SQL stock query
    }); // End prompt get
};
//# sourceMappingURL=bamazonCustomer.js.map