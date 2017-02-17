## Bamazon - A MySQL Node Application
This week, we've used Node.JS and MySQL to create a command line shop. Each time you purchase an item the stock will decrease by the amount purchased.

![Bamazon](http://g.recordit.co/G9VvMDWwkm.gif)

## Requirements
* Node.JS
* MySQL
* Babel (if compiling source)

## Get it Running

```
git clone https://github.com/FalseFlash/bamazon.git
npm install
```

First, run [query.sql](query.sql) to build the database and then run the command below to run the application.

Note: You'll have to create a `password.js` file in `/dist` folder with the following contents:
```
exports.password = 'Your Password';
```

```npm start``` after you've done the steps above.