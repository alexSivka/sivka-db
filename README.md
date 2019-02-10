# Nodejs clone of laravel QueryBuilder

This library is very fast and simple querybuilder for nodejs.
It do not depends of database server connection timeout, and automatically reconnects when server has gone away. Realized almost all features of laravel DB and some sugar added.

Documentation is available in two languages

- [english](./docs/en/syntax.md)
- [russian](./docs/ru/syntax.md)

## Getting Started

### Installing
```
npm i sivka-db
```

### Simple example

```js
const config = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test',
    port: 3306 // optional, default is 3306
};

const db = require('sivka-db')(config);

(async () => {
	
	let user = await db.table('users').where('id', 1).first(); // or

	user = await db.table('users').find(1);

	let users = await db.table('users').
		where('name', '!=', 'John').orWhere('surname', 'Dou').get(); 

})();
```


Full documentation read here

- [english](./docs/en/syntax.md)
- [russian](./docs/ru/syntax.md)

## Built With

* [mysqljs/mysql](https://github.com/mysqljs/mysql)
 


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details


