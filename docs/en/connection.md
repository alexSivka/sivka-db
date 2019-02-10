# Connection

Connection to database maybe activated by two ways

```js
const config = {
    host: 'localhost',
    username: 'root',
    password: 'root',
    database: 'test'
};

const db = require('sivka-db')(config);
```
```js
const db = require('sivka-db')();

(async () => {
    await db.connect(config);
})();
```

### direct query

This method always returns an array.
```js
let res = await db.sql("SELECT * FROM usesr");

// or as Promise
db.sql("SELECT * FROM usesr").then( (res) => {
    ...
});
```


### close connection

There are two ways to end a connection. Terminating a connection gracefully is done by calling the `end` method:

```js
await db.end();
```

An alternative way to end the connection is to call the `destroy` method. This will cause an immediate termination of the underlying socket.

```js
db.destroy();
```

### reconnect

After destroying connection by `end` or `destroy` method, 
you can reconnect to database by calling `reConnect` method, optionally provide new config

```js
db.destroy();
await db.reConnect();

const config2 = {
    host: 'localhost',
    username: 'root',
    password: 'root',
    database: 'test2'
};

db.destroy();
await db.reConnect(config2);
```

## Connection options

* `host`: The hostname of the database you are connecting to. (Default:
  `localhost`)
* `port`: The port number to connect to. (Default: `3306`)
* `localAddress`: The source IP address to use for TCP connection. (Optional)
* `socketPath`: The path to a unix domain socket to connect to. When used `host`
  and `port` are ignored.
* `user`: The MySQL user to authenticate as.
* `password`: The password of that MySQL user.
* `database`: Name of the database to use for this connection (Optional).
* `charset`: The charset for the connection. This is called "collation" in the SQL-level
  of MySQL (like `utf8_general_ci`). If a SQL-level charset is specified (like `utf8mb4`)
  then the default collation for that charset is used. (Default: `'UTF8_GENERAL_CI'`)
* `timezone`: The timezone configured on the MySQL server. This is used to type cast server date/time values to JavaScript `Date` object and vice versa. This can be `'local'`, `'Z'`, or an offset in the form `+HH:MM` or `-HH:MM`. (Default: `'local'`)
* `insecureAuth`: Allow connecting to MySQL instances that ask for the old
  (insecure) authentication method. (Default: `false`)
* `typeCast`: Determines if column values should be converted to native
   JavaScript types. (Default: `true`)
* `supportBigNumbers`: When dealing with big numbers (BIGINT and DECIMAL columns) in the database,
  you should enable this option (Default: `false`).
* `bigNumberStrings`: Enabling both `supportBigNumbers` and `bigNumberStrings` forces big numbers
  (BIGINT and DECIMAL columns) to be always returned as JavaScript String objects (Default: `false`).
  Enabling `supportBigNumbers` but leaving `bigNumberStrings` disabled will return big numbers as String
  objects only when they cannot be accurately represented with [JavaScript Number objects] (http://ecma262-5.com/ELS5_HTML.htm#Section_8.5)
  (which happens when they exceed the [-2^53, +2^53] range), otherwise they will be returned as
  Number objects. This option is ignored if `supportBigNumbers` is disabled.
* `dateStrings`: Force date types (TIMESTAMP, DATETIME, DATE) to be returned as strings rather than
   inflated into JavaScript Date objects. Can be `true`/`false` or an array of type names to keep as
   strings. (Default: `false`)


