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

There are two ways to end a connection. Terminating a connection gracefully is done by calling the **end** method:

```js
await db.end();
```

An alternative way to end the connection is to call the **destroy** method. This will cause an immediate termination of the underlying socket.

```js
db.destroy();
```

### reconnect

After destroying connection by **end** or **destroy** method, 
you can reconnect to database by calling **reConnect** method, optionally provide new config

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


