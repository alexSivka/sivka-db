In fact this document is rewrited copy of 
[Laravel Database: Query Builder](https://laravel.com/docs/5.7/queries)

## Connection

```js
const config = {
    host: 'localhost',
    username: 'root',
    password: 'root',
    database: 'test'
};

const db = require('sivka-db')(config);
```

**[More about connection](./connection.md)**

- [Start query](#start-query)
- [Retrieving Results](#retrieving-results)
- [Aggregates](#aggregates)
- [Selects](#selects)
- [Raw Expressions](#raw-expressions)
  - [Raw Methods](#raw-methods)
    - [selectRaw](#selectraw)
    - [whereRaw / orWhereRaw](#whereraw--orwhereraw)
    - [havingRaw / orHavingRaw](#havingraw--orhavingraw)
    - [orderByRaw](#orderbyraw)
- [Joins](#joins)
- [Unions](#unions)
- [Where Clauses](#where-clauses)
  - [Additional Where Clauses](#additional-where-clauses)
    - [whereBetween / whereNotBetween](#wherebetween--wherenotbetween)
    - [whereIn / whereNotIn](#wherein--wherenotin)
    - [whereNull / whereNotNull](#wherenull--wherenotnull)
    - [whereDate / whereMonth / whereDay / whereYear / whereTime / whereWeek](#wheredate--wheremonth--whereday--whereyear--wheretime--whereweek)
    - [whereColumn](#wherecolumn)
  - [Parameter Grouping](#parameter-grouping)
- [Ordering, Grouping, Limit, Offset](#ordering-grouping-limit-offset)
    - [orderBy](#orderby)
    - [latest / oldest](#latest--oldest)
    - [inRandomOrder](#inrandomorder)
    - [groupBy / having / orHaving](#groupby--having--orhaving)
    - [skip / take / offset / limit](#skip--take--offset--limit)
- [Conditional Clauses](#conditional-clauses)
- [Insert](#insert)
- [Update](#update)
- [Increment and Decrement](#increment-and-decrement)
- [Deletes](#deletes)
  - [truncate / drop](#truncate--drop)
- [Usefull helpers](#usefull-helpers)
  - [toSql](#tosql)
  - [getColumnNames](#getcolumnnames)
  - [find](#find)


## Start query
All queries starts as defining table name
```js
db.table('users')
```

## Retrieving Results

```js
let users = await db.table('users').get();
```
The **get** method returns an array containing the results where each result is  key-value pair object.

If you just need to retrieve a single row from the database table, you may use the **first** method. This method will return a key-value pair object

```js
let user = await db.table('users').where('name', 'John').first();
```

If you don't even need an entire row, you may extract a single value from a record using the **value** method. This method will return the value of the column directly:
```js
let email = await db.table('users').where('name', 'John').value('email');
```

If you would like to retrieve a array containing the values of a single column, you may use the **pluck** method. In this example, we'll retrieve a array of role titles:

```js
let titles = await db.table('roles').pluck('title');
```

You may also specify a custom key column for the returned array:

```js
let roles = await db.table('roles').pluck('title', 'name');
```

## Aggregates

The query builder also provides a variety of aggregate methods such as **count**, **max**, **min**, **avg**, and **sum**. You may call any of these methods after constructing your query:

```js
let johns = await db.table('users').where('name', 'John').count();
let date = await db.table('users').avg('birthday');
```

Instead of using the count method to determine if any records exist that match your query's constraints, you may use the **exists** and **doesntExist** methods:

```js
let state = await db.table('orders').where('finalized', 1).exists();
let state = await db.table('orders').where('finalized', 1).doesntExist();
```

## Selects

Using the select method, you can specify a custom **select** clause for the query:

```js
let users = await db.table('users').select('name', 'email as user_email').get();
// or array
let users = await db.table('users').select(['name', 'email']).get();
```
If you wish to add a column to its existing select clause, you may use the **addSelect** method:

```js
let query = await db.table('users').select('email');
query.addSelect('id', 'name');
```
The **distinct** method allows you to force the query to return distinct results:

```js
let email = await db.table('users').where('name', 'John').distinct().get();
```
## Raw Expressions

To create a raw expression, you may use the **db.raw** method:

```js
users = await db.table('users').select(db.raw('count(*) as user_count, status')).get();
prices = await db.table('users').select(db.raw('price * ? as newPrice', [1.5])).get();
```

### Raw Methods

#### selectRaw
The selectRaw method can be used in place of select(db.raw(...)). This method accepts an optional array of bindings as its second argument:

```js
orders = await db.table('orders').selectRaw('price * ? as price_with_tax', [1.0825]).get();
```

#### whereRaw / orWhereRaw

These methods accept an optional array of bindings as their second argument:

```js
orders = await db.table('orders').whereRaw('price > IF(state = "TX", ?, 100)', [200]).get();
```

#### havingRaw / orHavingRaw

The **havingRaw** and **orHavingRaw** methods may be used to set a raw string as the value of the **having** clause. These methods accept an optional array of bindings as their second argument:

```js
orders = await db.table('orders').select('department', db.raw('SUM(price) as total_sales'))
                .havingRaw('SUM(price) > ?', [2500]).get();
```

#### orderByRaw
The **orderByRaw** method may be used to set a raw string as the value of the order by clause:
```js
let orders = await db.table('orders').orderByRaw('updated_at - created_at DESC').get();
```

## Joins

To perform a basic "inner join", you may use the **join** method on a query builder instance. The first argument passed to the join method is the name of the table you need to join to, while the remaining arguments specify the column constraints for the join

```js
users = await db.table('users')
            .join('contacts', 'users.id', '=', 'contacts.user_id')
            .join('orders', 'users.id', '=', 'orders.user_id')
            .select('users.*', 'contacts.phone', 'orders.price')
            .get();
```

Available join methods: **leftJoin**, **rightJoin**, **crossJoin**

## Unions

```js
let first = await db.table('users').whereNull('first_name');

let users = await db.table('users').whereNull('last_name').union(first).get();
```

## Where Clauses

```js
let users = await db.table('users').where('votes', '=', 100).get();
// or simple
let users = await db.table('users').where('votes', 100).get();

let users = await db.table('users').where('votes', '>=', 100).get();

let users = await db.table('users').where('name', 'like', '%john%').get();

let users = await db.table('users').where([
                ['status', '=', '1'],
                ['subscribed', '<>', '1'],
            ]).get();
```

You may chain where constraints together as well as add or clauses to the query. The orWhere method accepts the same arguments as the where method:

```js
let users = await db:table('users')
                    .where('votes', '>', 100)
                    .orWhere('name', 'John')
                    .get();
```
### Additional Where Clauses

#### whereBetween / whereNotBetween

```js
let users = await db.table('users').whereBetween('votes', [1, 100]).get();

let users = await db.table('users').whereNotBetween('votes', [1, 100]).get();
```

#### whereIn / whereNotIn

```js
let users = await db.table('users').whereIn('id', [1, 2, 3]).get();

let users = await db.table('users').whereNotIn('id', [1, 2, 3]).get();
```


#### whereNull / whereNotNull

```js
let users = await db.table('users').whereNull('date').get();

let users = await db.table('users').whereNotNull('date').get();
```

#### whereDate / whereMonth / whereDay / whereYear / whereTime / whereWeek

```js
let users = await db.table('users').whereDate('date', '2019-01-01').get();
```

#### whereColumn
The **whereColumn** method may be used to verify that two columns are equal:
```js
let users = await db.table('users').whereColumn('first_name', 'last_name').get();

let users = await db.table('users').whereColumn('first_name', '!=',  'last_name').get();
```

### Parameter Grouping

```js
let users = await db.table('users')
            .where('name', '=', 'John')
            .where( (query) => {
                query.where('votes', '>', 100).orWhere('title', '=', 'Admin');
            })
            .get();
```

The example above will produce the following SQL:

```sql
SELECT * FROM `users` WHERE `name` = 'John' AND (`votes` > 100 OR `title` = 'Admin')
```

## Ordering, Grouping, Limit, Offset

#### orderBy

```js
let users = await db.table('users').orderBy('name').get();
let users = await db.table('users').orderBy('name', 'desc').get();
let users = await db.table('users').orderBy('id').orderBy('name', 'desc').get();
```

#### latest / oldest
The **latest** and **oldest** methods allow you to easily order results by date. By default, result will be ordered by the **created_at** column. Or, you may pass the column name that you wish to sort by:
```js
let oldUser = await db.table('users').oldest().first();
let youngUser = await db.table('users').latest('birthday').first();
```

#### inRandomOrder

The **inRandomOrder** method may be used to sort the query results randomly.
```js
let randomUser = await db.table('users').inRandomOrder().first();
```

#### groupBy / having / orHaving

The **groupBy** and **having** methods may be used to group the query results. The **having** method's signature is similar to that of the **where** method:

```js
let users = await db.table('users')
                    .groupBy('account_id')
                    .having('account_id', '>', 100)
                    .get();
```
#### skip / take / offset / limit

```js
let users = await db.table('users').offset(10).limit(5).get();
let users = await db.table('users').skip(10).take(5).get();
let users = await db.table('users').limit(10, 5).get();
// SELECT * FROM `users` LIMIT 10, 5
```

## Conditional Clauses

Sometimes you may want clauses to apply to a query only when something else is true.
You may accomplish this using the when method:

```js
let role = 'admin';

let users = await db.table('users')
                    .when(role, (query) => {
                        return query.where('role_name', role);
                    })
                    .get();
```
The **when** method only executes the given Closure when the first parameter is not false

You may pass another Closure as the third parameter to the when method. This Closure will execute if the first parameter evaluates as false.

```js
let sortBy = null;

let users = await db.table('users')
                    .when(sortBy, (query) => {
                        query.orderBy(sortBy);
                    }, (query) => {
                        query.orderBy('name');
                    })
                    .get();
```

## Insert

```js
let insertId = await db.table('users')
                        .insert({email: 'john@example.com', votes: 0});
```

## Update

```js
let changedRows = await db.table('users').where('id', 1)
                        .update({email: 'john@example.com', votes: 0});
```

**insert** and **update** has second argument. If this argument set to **true**, 
only existing columns will be updated / inserted. Example:

```js
// table users has two columns: id | name
let post = {
    name: 'test', tmpData: 'tmp', anotherData: 'gut'
}

let changedRows = await db.table('users').where('id', 1).update(post, true);
// generated sql: UPDATE `users` SET `name` = 'test' WHERE `id` = 1
```

## Increment and Decrement

The query builder also provides convenient methods for incrementing or decrementing the value of a given column.

```js
await db.table('users').increment('votes');
await db.table('users').decrement('votes', 2);
await db.table('users').where('name', 'Valera').increment('votes');
```

## Deletes

```js
let changedRows = await db.table('users').where('votes', '>', 100).delete();
```

### truncate / drop

```js
await db.table('users').truncate();
await db.table('users').drop();
```

## Usefull helpers

### toSql

The toSql method must be before final method in query chain. If toSql method is in query, returned result will be generated sql statement

```js
let res = await db.table('users').where('name', 'Valera').toSql().get();
// res = SELECT * FROM `users` WHERE `name` = 'Valera'

let res = await db.table('users').insert({condition: 'gut'}).toSql().insert();
// res = INSERT INTO `users` SET `condition` = 'gut'
```

### getColumnNames

getColumnNames returns an array of column names for provided table

```js
// table users has three columns: id | name | condition
let names = await db.table('users').getColumnNames();
// names = ['id', 'name', 'condition']
```

### find

**find** method returns first matched record with provided **id**

```js
let names = await db.table('users').find(1);
```
