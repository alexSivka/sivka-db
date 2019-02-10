По большей части, этот документ преписанная под js копия 
[Laravel Database: Query Builder](https://laravel.com/docs/5.7/queries)

## Соединение с базой

[опции соединения](../en/connection.md#connection-options)

```js
const config = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test'
};

const db = require('sivka-db')(config);
```

[еще о соединении](../en/connection.md)

### Содержание
- [Начало запроса](#Начало-запроса)
- [Результаты](#Результаты)
- [Aggregates](#aggregates)
- [Выборка (Selects)](#Выборка-selects)
- [Сырые выражения (Raw Expressions)](#Сырые-выражения-raw-expressions)
  - [Сырые методы (Raw Methods)](#Сырые-методы-raw-methods)
    - [selectRaw](#selectraw)
    - [whereRaw / orWhereRaw](#whereraw--orwhereraw)
    - [havingRaw / orHavingRaw](#havingraw--orhavingraw)
    - [orderByRaw](#orderbyraw)
- [Объединения (Joins)](#Объединения-joins)
- [Слияние (Unions)](#Слияние-unions)
- [Условия (Where Clauses)](#Условия-where-clauses)
  - [Дополнительные условия (Additional Where Clauses)](#Дополнительные-условия-additional-where-clauses)
    - [whereBetween / whereNotBetween](#wherebetween--wherenotbetween)
    - [whereIn / whereNotIn](#wherein--wherenotin)
    - [whereNull / whereNotNull](#wherenull--wherenotnull)
    - [whereDate / whereMonth / whereDay / whereYear / whereTime / whereWeek](#wheredate--wheremonth--whereday--whereyear--wheretime--whereweek)
    - [whereColumn](#wherecolumn)
  - [Группировка условий (Parameter Grouping)](#Группировка-условий-parameter-grouping)
- [Ordering, Grouping, Limit, Offset](#ordering-grouping-limit-offset)
    - [orderBy](#orderby)
    - [latest / oldest](#latest--oldest)
    - [inRandomOrder](#inrandomorder)
    - [groupBy / having / orHaving](#groupby--having--orhaving)
    - [skip / take / offset / limit](#skip--take--offset--limit)
- [Conditional Clauses](#conditional-clauses)
- [Вставка (Insert)](#Вставка-insert)
- [Обновление (Update)](#Обновление-update)
- [Increment and Decrement](#increment-and-decrement)
- [Удаление (Deletes)](#Удаление-deletes)
  - [truncate / drop](#truncate--drop)
- [Полезные дополнения (Usefull helpers)](#Полезные-дополнения-usefull-helpers)
  - [toSql](#tosql)
  - [getColumnNames](#getcolumnnames)
  - [find](#find)

## Начало запроса
Все запросы к базе начинаются с определения таблицы.
```js
db.table('users')
```

## Результаты

```js
let users = await db.table('users').get();
```
Метод `get` возвращает массив резульататов с объектами типа ключ-значение

Если вам необходимо получить только одну строку из таблицы БД, используйте метод `first`. Этот метод вернёт один объект.

```js
let user = await db.table('users').where('name', 'John').first();
```

Если вам не нужна вся строка, вы можете извлечь одно значение из записи методом `value`. Этот метод вернёт значение конкретного столбца:
```js
let email = await db.table('users').where('name', 'John').value('email');
```

Если вы хотите получить массив значений одного столбца, используйте метод `pluck`. В этом примере мы получим массив названий ролей:

```js
let titles = await db.table('roles').pluck('title');
```

Вы можете указать произвольный ключ для возвращаемого массива:

```js
let roles = await db.table('roles').pluck('title', 'name');
```

## Aggregates

Конструктор запросов содержит множество агрегатных методов, таких как `count`, `max`, `min`, `avg`, and `sum`. Вы можете вызывать их после создания своего запроса:

```js
let johns = await db.table('users').where('name', 'John').count();
let date = await db.table('users').avg('birthday');
```

Для проверки существования записи, вместо метода `count` можно использовать методы `exists` и `doesntExist`:

```js
let state = await db.table('orders').where('finalized', 1).exists();
let state = await db.table('orders').where('finalized', 1).doesntExist();
```

## Выборка (Selects)

Используя метод `select` вы можете указать необходимые столбцы для запроса:

```js
let users = await db.table('users').select('name', 'email as user_email').get();
// or array
let users = await db.table('users').select(['name', 'email']).get();
```
Если у вас уже есть экземпляр конструктора запросов и вы хотите добавить столбец к существующему набору для выборки, используйте метод `addSelect`:

```js
let query = await db.table('users').select('email');
query.addSelect('id', 'name');
```
Метод `distinct` позволяет вернуть только отличающиеся результаты:

```js
let email = await db.table('users').where('name', 'John').distinct().get();
```
## Сырые выражения (Raw Expressions)

Иногда вам может понадобиться использовать уже готовое SQL-выражение в вашем запросе. Такие выражения вставляются в запрос напрямую в виде строк.  Для создания такого выражения используйте метод `db.raw`:

```js
users = await db.table('users').select(db.raw('count(*) as user_count, status')).get();
prices = await db.table('users').select(db.raw('price * ? as newPrice', [1.5])).get();
```



### Сырые методы (Raw Methods)

#### selectRaw
Метод `selectRaw` может быть ипользован вместо `select(db.raw(...))`. Этот метод опционально принимает вторым аргументом массив значений для плейсхолдеров:

```js
orders = await db.table('orders')
                .selectRaw('price * ? as price_with_tax', [1.0825])
                .get();
```

#### whereRaw / orWhereRaw

Эти методы опционально принимают вторым аргументом массив значений для плейсхолдеров:

```js
orders = await db.table('orders')
                .whereRaw('price > IF(state = "TX", ?, 100)', [200])
                .get();
```

#### havingRaw / orHavingRaw

```js
orders = await db.table('orders')
                .select('department', db.raw('SUM(price) as total_sales'))
                .havingRaw('SUM(price) > ?', [2500])
                .get();
```

#### orderByRaw

```js
let orders = await db.table('orders').orderByRaw('updated_at - created_at DESC').get();
```

## Объединения (Joins)

Конструктор запросов может быть использован для объединения данных из нескольких таблиц через `join`. Первый аргумент метода `join` - имя таблицы, к которой необходимо присоединить другие, а остальные аргументы указывают условия для присоединения столбцов.

```js
users = await db.table('users')
            .join('contacts', 'users.id', '=', 'contacts.user_id')
            .join('orders', 'users.id', '=', 'orders.user_id')
            .select('users.*', 'contacts.phone', 'orders.price')
            .get();
```

Доступные методы: `leftJoin`, `rightJoin`, `crossJoin`

## Слияние (Unions)

Конструктор запросов позволяет создавать слияния двух запросов вместе. Например, вы можете создать начальный запрос и с помощью метода `union` слить его со вторым запросом:

```js
let first = await db.table('users').whereNull('first_name');

let users = await db.table('users').whereNull('last_name').union(first).get();
```

## Условия (Where Clauses)

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

Вы можете сцепить вместе условия `where`, а также условия or в запросе. Метод `orWhere` принимает те же аргументы, что и метод `where`:

```js
let users = await db:table('users')
                    .where('votes', '>', 100)
                    .orWhere('name', 'John')
                    .get();
```
### Дополнительные условия (Additional Where Clauses)

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
Для проверки на совпадение двух столбцов можно использовать метод `whereColumn`:
```js
let users = await db.table('users').whereColumn('first_name', 'last_name').get();

let users = await db.table('users').whereColumn('first_name', '!=',  'last_name').get();
```

### Группировка условий (Parameter Grouping)

Иногда вам нужно сделать выборку по более сложным параметрам, таким как «существует ли» или вложенная группировка условий. 

```js
let users = await db.table('users')
            .where('name', '=', 'John')
            .where( (query) => {
                query.where('votes', '>', 100).orWhere('title', '=', 'Admin');
            })
            .get();
```

Приведённый пример выполнит такой SQL-запрос:

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
Методы `latest` и `oldest` позволяют легко отсортировать результаты по дате. По умолчанию выполняется сортировка по столбцу created_at. Или вы можете передать имя столбца для сортировки по нему:
```js
let oldUser = await db.table('users').oldest().first();
let youngUser = await db.table('users').latest('birthday').first();
```

#### inRandomOrder

Для сортировки результатов запроса в случайном порядке можно использовать метод `inRandomOrder`.
```js
let randomUser = await db.table('users').inRandomOrder().first();
```

#### groupBy / having / orHaving

Методы `groupBy` и `having` используются для группировки результатов запроса. Сигнатура метода `having` аналогична методу `where`:

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

Иногда необходимо применять условие к запросу, только если выполняется какое-то другое условие. Например, выполнять оператор `where`, только если нужное значение есть во входящем запросе. Это можно сделать с помощью метода `when`:

```js
let role = 'admin';

let users = await db.table('users')
                    .when(role, (query) => {
                        return query.where('role_name', role);
                    })
                    .get();
```
Метод `when` выполняет данное замыкание, только когда первый параметр не равен `false`.

Вы можете передать ещё одно замыкание третьим параметром метода `when`. Это замыкание будет выполнено, если первый параметр будет иметь значение `false`

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

## Вставка (Insert)

```js
let insertId = await db.table('users')
                        .insert({email: 'john@example.com', votes: 0});
```

## Обновление (Update)

```js
let changedRows = await db.table('users').where('id', 1)
                        .update({email: 'john@example.com', votes: 0});
```

У `insert` и `update` есть второй необязательный аргумент. Если этот аргумент установлен в `true`, 
то только существующие колонки попадут в запрос:

```js
// table users has two columns: id | name
let post = {
    name: 'test', tmpData: 'tmp', anotherData: 'gut'
}

let changedRows = await db.table('users').where('id', 1).update(post, true);
// generated sql: UPDATE `users` SET `name` = 'test' WHERE `id` = 1
```

## Increment and Decrement

Конструктор запросов предоставляет удобные методы для увеличения и уменьшения значений заданных столбцов. Это просто более краткий способ по сравнению с написанием оператора `update` вручную.

Оба метода принимают один обязательный аргумент — столбец для изменения. Второй аргумент может быть передан для указания, на какую величину необходимо изменить значение столбца:

```js
await db.table('users').increment('votes');
await db.table('users').decrement('votes', 2);
await db.table('users').where('name', 'Valera').increment('votes');
```

## Удаление (Deletes)

```js
let changedRows = await db.table('users').where('votes', '>', 100).delete();
```

### truncate / drop

```js
await db.table('users').truncate();
await db.table('users').drop();
```

## Полезные дополнения (Usefull helpers)

### toSql

Метод `toSql` позволяет вместо результатов запроса вернуть сгенерированное SQL выражение. Метод может быть вызван в любом месте до финального метода.

```js
let res = await db.table('users').where('name', 'Valera').toSql().get();
// res = SELECT * FROM `users` WHERE `name` = 'Valera'

let res = await db.table('users').insert({condition: 'gut'}).toSql().insert();
// res = INSERT INTO `users` SET `condition` = 'gut'
```

### getColumnNames

Метод `getColumnNames` возвращает массив имен столбцов указанной таблицы.

```js
// table users has three columns: id | name | condition
let names = await db.table('users').getColumnNames();
// names = ['id', 'name', 'condition']
```

### find

Метод `find` возвращает запись с соответствущим `id`

```js
let names = await db.table('users').find(1);
```
