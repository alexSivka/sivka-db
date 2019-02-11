
/**
 * @todo whereExists, JSON Where Clauses, unionAll
 */

module.exports = class Query {

    constructor(db, tableName = ''){
        this.db = db;
        this.data = {
            tableName: this.wrapField(tableName),
            command: 'SELECT',
            fields: [],
            distinct: '',
            where: [],
            orWhere: [],
            groupBy: [],
            having: [],
            orHaving: [],
            orderBy: [],
            limit: [],
            union: [],
            innerJoin: [],
            leftJoin: [],
            rightJoin: [],
            crossJoin: []
        }
        this.asSql = false;
    }

    /**
     * inner method
     * @param {string} sql 
     */
    sql(sql){
        if(this.asSql){
            this.asSql = false;
            return sql;
        }
        return this.db.sql(sql);
    }

    /**
     * set returned as sql string
     * @returns this
     */
    toSql(flag = true){
        return this.self( this.asSql = flag );
    }

    /**
     * @param {Object} query - Query object instance
     * @returns {object} this
     */
    union(query){
        return this.self( this.data.union.push(query) );
    }

    /**
     * @param {string} tableName - name of joined table
     * @param {string} column1 - left column name
     * @param {string} operator - operator(=, !=, etc)
     * @param {string} column2 - right column name
     * @returns this
     */
    join(tableName, column1, operator, column2){
        this.data.innerJoin.push(
            this.wrapField(tableName) + ' ON ' + this.wrapField(column1) + ' ' + operator + ' ' + this.wrapField(column2)
        );
        return this;
    }

    /**
     * @param {string} tableName - name of joined table
     * @param {string} column1 - left column name
     * @param {string} operator - operator(=, !=, etc)
     * @param {string} column2 - right column name
     * @returns this
     */
    innerJoin(tableName, column1, operator, column2){
        return this.join(tableName, column1, operator, column2);
    }

    /**
     * @param {string} tableName - name of joined table
     * @param {string} column1 - left column name
     * @param {string} operator - operator(=, !=, etc)
     * @param {string} column2 - right column name
     * @returns this
     */
    leftJoin(tableName, column1, operator, column2){
        this.data.leftJoin.push(
            this.wrapField(tableName) + ' ON ' + this.wrapField(column1) + ' ' + operator + ' ' + this.wrapField(column2)
        );
        return this;
    }

    /**
     * @param {string} tableName - name of joined table
     * @param {string} column1 - left column name
     * @param {string} operator - operator(=, !=, etc)
     * @param {string} column2 - right column name
     * @returns this
     */
    rightJoin(tableName, column1, operator, column2){
        this.data.rightJoin.push(
            this.wrapField(tableName) + ' ON ' + this.wrapField(column1) + ' ' + operator + ' ' + this.wrapField(column2)
        );
        return this;
    }

    /**
     * @param {string} tableName - name of joined table
     * @param {string} [column1] - left column name
     * @param {string} [operator] - operator(=, !=, etc)
     * @param {string} [column2] - right column name
     * @returns this
     */
    crossJoin(tableName, column1 = false, operator = false, column2 = false){
        if(!column1) return this.self( this.data.crossJoin.push( this.wrapField(tableName)) );
        this.data.crossJoin.push(
            this.wrapField(tableName) + ' ON ' + this.wrapField(column1) + ' ' + operator + ' ' + this.wrapField(column2)
        );
        return this;
    }

    /**
     * @param {string|function|Array} column - column name or closure or array of where clauses
     * @param {string} [arg1] - operator(=, !=, etc) or value
     * @param {string} [arg2] - value
     * @param {string} [dataName] name of operation (where, orWhere), used for inner calls
     * @returns this
     */
    where(column, arg1 = false, arg2 = false, dataName = 'where'){

        if(typeof column == 'function') return this.whereGroup(column, dataName);

        if(Array.isArray(column)){
            for(let item of column) this.data[dataName].push(this.whereString(...item));
        }else{
            this.data[dataName].push(this.whereString(column, arg1, arg2));
        }
        
        return this;
    }

    /**
     * inner method
     * @param {string|function|Array} column - column name or closure or array of where clauses
     * @param {string} [arg1] - operator(=, !=, etc) or value
     * @param {string} [arg2] - value
     * @returns void
     */
    whereString(column, arg1 = false, arg2 = false){
        if(arg1 === false) return column;
        else if(arg2 === false) return this.wrapField(column) + " = " + this.escape(arg1);
        else return this.wrapField(column) + " "+ arg1 +" " + this.escape(arg2);
    }

    /**
     * @param {string} sql  - sql statement
     * @returns this
     */
    whereRaw(sql, values = []){
        return this.self( this.data.where.push( this.db.format(sql, values) ) );
    }

    /**
     * @param {string|function|Array} column - column name or closure or array of where clauses
     * @param {string} [arg1] - operator(=, !=, etc) or value
     * @param {string} [arg2] - value
     * @returns this
     */
    orWhere(column, arg1 = false, arg2 = false){
        return this.where(column, arg1, arg2, 'orWhere');
    }

    /**
     * @param {string} sql  - sql statement
     * @returns this
     */
    orWhereRaw(sql, values = []){
        return this.self( this.data.orWhere.push( this.db.format(sql, values) ) );
    }

    /**
     * @param {string} column - column name
     * @param {Array} values - array of values
     * @returns this
     */
    whereIn(column, values){
        return this.where(this.wrapField(column) + " IN(" + values.join(',') + ")");
    }

    /**
     * @param {string} column - column name
     * @param {Array} values - array of values
     * @returns this
     */
    whereNotIn(column, values){
        return this.where(this.wrapField(column) + " NOT IN(" + values.join(', ') + ")");
    }

    /**
     * @param {string} column - column name
     * @param {Array} values - array of values
     * @returns this
     */
    whereBetween(column, values){
        return this.where(this.wrapField(column) + " BETWEEN " + this.escape(values[0]) + " AND " + this.escape(values[1]) );
    }

    /**
     * @param {string} column - column name
     * @param {Array} values - array of values
     * @returns this
     */
    whereNotBetween(column, values){
        return this.where(this.wrapField(column) + " NOT BETWEEN " + this.escape(values[0]) + " AND " + this.escape(values[1]) );
    }

    /**
     * @param {string} column - column name
     * @returns this
     */
    whereNull(column){
        return this.where(this.wrapField(column) + ' IS NULL');
    }
    
    /**
     * @param {string} column - column name
     * @returns this
     */
    whereNotNull(column){
        return this.where(this.wrapField(column) + ' IS NOT NULL');
    }

    /**
     * @param {string} column - column name
     * @param {string} arg1 - operator(=, !=, etc) or value
     * @param {string} [arg2] - value
     * @returns this
     */
    whereDate(column, arg1, arg2 = false){
        return this.whereDateSql('DATE', column, arg1, arg2);
    }

    /**
     * @param {string} column - column name
     * @param {string} arg1 - operator(=, !=, etc) or value
     * @param {string} [arg2] - value
     * @returns this
     */
    whereDay(column, arg1, arg2 = false){
        return this.whereDateSql('DAY', column, arg1, arg2);
    }

    /**
     * @param {string} column - column name
     * @param {string} arg1 - operator(=, !=, etc) or value
     * @param {string} [arg2] - value
     * @returns this
     */
    whereWeek(column, arg1, arg2 = false){
        return this.whereDateSql('WEEK', column, arg1, arg2);
    }

    /**
     * @param {string} column - column name
     * @param {string} arg1 - operator(=, !=, etc) or value
     * @param {string} [arg2] - value
     * @returns this
     */
    whereMonth(column, arg1, arg2 = false){
        return this.whereDateSql('MONTH', column, arg1, arg2);
    }

    /**
     * @param {string} column - column name
     * @param {string} arg1 - operator(=, !=, etc) or value
     * @param {string} [arg2] - value
     * @returns this
     */
    whereYear(column, arg1, arg2 = false){
        return this.whereDateSql('YEAR', column, arg1, arg2);
    }

    /**
     * @param {string} column - column name
     * @param {string} arg1 - operator(=, !=, etc) or value
     * @param {string} [arg2] - value
     * @returns this
     */
    whereTime(column, arg1, arg2 = false){
        return this.whereDateSql('TIME', column, arg1, arg2);
    }

    /**
     * inner method
     * @param {string} func - sql date function name
     * @param {string} column - column name
     * @param {string} arg1 - operator(=, !=, etc) or value
     * @param {string} [arg2] - value
     * @returns this
     */
    whereDateSql(func, column, arg1, arg2 = false){
        if(arg2 === false) this.data.where.push( func + "(" + this.wrapField(column) + ") = " + this.escape(arg1));
        else this.data.where.push( func + "(" + this.wrapField(column) + " "+ arg1 +" " + this.escape(arg2) );
        return this;
    }

    /**
     * @param {string|Array} column - first column name or array of sql statements
     * @param {string} [arg1] - operator(=, !=, etc) or second column name
     * @param {string} [arg2] - second column name
     * @returns this
     */
    whereColumn(column, arg1 = false, arg2 = false){
        if(Array.isArray(column)){
            for(let item of column) this.data.where.push(this.whereColumnString(...item));
        }else{
            this.data.where.push(this.whereColumnString(column, arg1, arg2));
        }
        return this;
    }

    /**
     * inner method
     * @param {string} column - column name
     * @param {string} arg1 - operator(=, !=, etc) or second column name
     * @param {string} [arg2] - second column name
     * @returns void
     */
    whereColumnString(column, arg1, arg2 = false){
        if(arg2 === false) return this.wrapField(column) + " = " + this.wrapField(arg1);
        else return this.wrapField(column) + " "+ arg1 +" " + this.wrapField(arg2);
    }

    /**
     * inner method
     * @param {function} func - closure
     * @param {string} dataName - where or orWhere
     * @returns this
     */
    whereGroup(func, dataName){
        let query = new Query(this.db);
        func(query);
        return this.self( this.data[dataName].push( '(' + query.whereToSql() + ')' ) );
    }

    /**
     * @param {string|array|function} columns - columns to group by
     * @returns this
     */
    groupBy(columns){
        if(typeof columns == 'string') columns = Array.from(arguments);
        if(typeof columns == 'function') return this.self( this.data.groupBy.push(columns()) );
        for(let name of columns) this.data.groupBy.push( this.wrapField(name) );
        return this;
    }

    /**
     * @param {string|function|Array} column - column name or closure or array of where clauses
     * @param {string} [arg1] - value or operator
     * @param {string} [arg2] - value
     * @returns this
     */
    having(column, arg1, arg2 = false){
        return this.where(column, arg1, arg2, 'having');
    }

    orHaving(column, arg1, arg2 = false){
        return this.where(column, arg1, arg2, 'orHaving');
    }

    havingRaw(sql, values = []){
        return this.where(this.db.format(sql, values), false, false, 'having');
    }

    orHavingRaw(sql, values = []){
        return this.where(this.db.format(sql, values), false, false, 'orHaving');
    }

    /**
     * @param {string} column - column name
     * @param {*} [dir] - direction of sorting
     * @returns this
     */
    orderBy(column, dir = 'ASC'){
        return this.self( this.data.orderBy.push(this.wrapField(column) + ' ' + dir.toUpperCase()) );
    }

    /**
     * @param {string} sql 
     * @param {array} values - values for placeholders
     * @returns this
     */
    orderByRaw(sql, values = []){
        return this.self( this.data.orderBy.push( this.db.format(sql, values) ) );
    }

    /**
     * order by RAND()
     * @returns this
     */
    inRandomOrder(){
        return this.self( this.data.orderBy.push( 'RAND()' ) );
    }

    /**
     * @param {string} [column] - column name to order
     * @returns this
     */
    oldest(column = 'created_at'){
        return this.self( this.data.orderBy.push( this.wrapField(column) + ' ASC' ) );
    }

    /**
     * @param {string} [column] - column name to order
     * @returns this
     */
    latest(column = 'created_at'){
        return this.self( this.data.orderBy.push( this.wrapField(column) + ' DESC' ) );
    }

    /**
     * @param {number} num1
     * @param {*} [num2] 
     * @returns this
     */
    limit(num1, num2 = 0){
        if(num2) this.data.limit = [num1, num2];
        else this.take(num1);
        return this;
    }

    /**
     * @param {number} num
     * @returns this
     */
    offset(num){
        return this.skip(num);
    }

    /**
     * @param {number} num
     * @returns this
     */
    take(num){
        return this.self( this.data.limit = this.data.limit.length ? [this.data.limit[0], num] : [0, num] );
    }

    /**
     * @param {number} num
     * @returns this
     */
    skip(num){
        return this.self( this.data.limit[0] = num );
    }

    /**
     * @returns array
     */
    get(){     
        return this.sql( this.unionToSql(this.getSql( this.selectCommand() )) );
    }

    // inner method
    selectCommand(){
        if(!this.data.fields.length) this.data.fields = ['*'];
        return 'SELECT ' + this.data.distinct + this.data.fields.join(', ') + ' FROM ' + this.data.tableName;
    }

    count(){
        return this.aggregate( ['COUNT(*) AS num'] );
    }

    max(column){
        return this.aggregate( this.data.fields = ['MAX('+ this.wrapField(column) +') AS num'] );      
    }

    min(column){
        return this.aggregate( this.data.fields = ['MIN('+ this.wrapField(column) +') AS num'] );      
    }

    avg(column){
        return this.aggregate( this.data.fields = ['AVG('+ this.wrapField(column) +') AS num'] );      
    }

    sum(column){
        return this.aggregate( this.data.fields = ['SUM('+ this.wrapField(column) +') AS num'] );      
    }

    /**
     * check if record exists
     * @returns boolean
     */
    async exists(){
        return Boolean(await this.first());
    }

    /**
     * check if record does not exists
     * @returns boolean
     */
    async doesntExist(){
        return !Boolean(await this.first());
    }

    /**
     * inner method
     */
    async aggregate(){
        let res = await this.first();
        return typeof res == 'string' ? res : res.num;
    }

    /**
     * @param {string} columnValue - column name for select
     * @param {string} [columnKey] - column name to use as keys
     * @returns array|object|null 
     */
    async pluck(columnValue, columnKey = false){
        this.data.fields = columnKey ? [this.wrapField(columnValue), this.wrapField(columnKey)] : [this.wrapField(columnValue)];
        let res = await this.get(), out = columnKey ? {} : [];
        if(typeof res == 'string') return res;
        if(!res.length) return null;
        for(let val of res){
            if(columnKey) out[ val[columnKey] ] = val[columnValue];
            else out.push( val[columnValue] );
        }
        return out;
    }

    /**
     * @param {string} column name - name of column, which value will be returned
     * @returns string|number|null
     */
    async value(column){
        this.data.fields = [column];
        let res = await this.first();
        if(typeof res == 'string') return res;
        return res ? res[column] : null;
    }

    /**
     * @returns object|null
     */
    first(){
        this.data.limit = [1];
        return new Promise( async (resolve) => {
            let res = await this.get();
            if(typeof res == 'string') resolve(res); 
            else resolve( res && res.length ? res[0] : null );
        });
    }

    /**
     * @param {number} id - id of record
     * @returns object
     */
    find(id){
        this.where('id', id);
        return this.first();
    }

    /**
     * @param {array} columns - array of columns names, if not defined will be used arguments
     * @returns this
     */
    select(columns = false){
        this.data.fields = [];
        if(columns === false) return this;
        return this.addSelect(typeof columns == 'string' ? Array.from(arguments) : columns);
    }

    /**
     * @param {string} sql - sql string 
     * @param {array} [values] - values for placeholders 
     */
    selectRaw(sql, values = []){
        return this.self( this.data.fields.push( this.db.format(sql, values) ) );
    }

    /**
     * @param {array} columns - array of columns names, if not defined will be used arguments
     * @returns this
     */
    addSelect(columns = false){
        if(columns === false) return this;
        if(typeof columns == 'string') columns = Array.from(arguments);
        if(typeof columns == 'function') return this.self( this.data.fields.push(columns()) );
        for(let name of columns) this.data.fields.push( this.wrapField(name) );
        return this;
    }

    distinct(){
        return this.self( this.data.distinct = 'DISTINCT ' );
    }

    /**
     * @param {object} values 
     * @param {boolean} onlyExisting - if set to true only existing columns will be inserted
     * @return number - id of inserted
     */
    async insert(values, onlyExisting = false){
        let sql = 'INSERT INTO ' + this.data.tableName + ' SET ' + await this.getAsSql(values, onlyExisting);
        let res = await this.sql(sql);
        return typeof res == 'string' ? res : res.insertId;
    }

    /**
     * @param {object} values 
     * @param {boolean} onlyExisting - if set to true only existing columns will be updated
     * @return number - number of changed rows
     */
    async update(values, onlyExisting = false){
        let command = 'UPDATE ' + this.data.tableName + ' SET ' + await this.getAsSql(values, onlyExisting);
        let res = await this.sql(this.getSql(command));
        return typeof res == 'string' ? res : res.changedRows;
    }

    /**
     * @return object|string
     */
    async delete(){
        let command = 'DELETE FROM ' + this.data.tableName;
        let res = await this.sql(this.getSql(command));
        return typeof res != 'string' ? res.changedRows : res;
    }

    increment(column, num = 1){
        let command = 'UPDATE ' + this.data.tableName + ' SET ' + this.wrapField(column) + ' = ' + this.wrapField(column) + ' + ' + parseInt(num);
        return this.sql(this.getSql(command));
    }

    decrement(column, num = 1){
        let sql = 'UPDATE ' + this.data.tableName + ' SET ' + this.wrapField(column) + ' = ' + this.wrapField(column) + ' - ' + parseInt(num);
        return this.sql(this.getSql(command));
    }

    /**
     * @returns array - array of column names
     */
    async getColumnNames(){
        let names = [];
        let res = await this.db.sql('show columns from ' + this.data.tableName);
        for(let obj of res) names.push(obj.Field);
        return names;
    }


    /**
     * inner method
     * @param {string} command 
     * @return string
     */
    getSql(command = ''){
        let sql = [command];

        if(this.data.innerJoin.length) sql.push( 'INNER JOIN ' + this.data.innerJoin.join(' INNER JOIN ') );

        if(this.data.leftJoin.length) sql.push( 'LEFT JOIN ' + this.data.innerJoin.join(' LEFT JOIN ') );

        if(this.data.rightJoin.length) sql.push( 'RIGHT JOIN ' + this.data.innerJoin.join(' RIGHT JOIN ') );

        if(this.data.crossJoin.length) sql.push( 'CROSS JOIN ' + this.data.crossJoin.join(' CROSS JOIN ') );

        let where = this.whereToSql();

        if(where) sql.push('WHERE ' + where);

        if(this.data.groupBy.length) sql.push( 'GROUP BY ' + this.data.groupBy.join(', '));

        let having = this.havingToSql();

        if(having) sql.push('HAVING ' + having);

        if(this.data.orderBy.length) sql.push( 'ORDER BY ' + this.data.orderBy.join(', '));

        if(this.data.limit.length) sql.push('LIMIT ' + this.data.limit.join(', '));

        return sql.join(' ');
    }

    /**
     * inner method
     * @param {string} firstSql 
     * @returns string
     */
    unionToSql(firstSql){
        if(!this.data.union.length) return firstSql;
        let sql = [];
        sql = ['(' + firstSql + ')'];
        for(let q of this.data.union) sql.push( '(' + q.getSql(q.selectCommand()) + ')' );
        return sql.join(' UNION ');
    }

    /**
     * inner method
     * @returns string
     */
    whereToSql(){
        let sql = [];
        if(this.data.where.length) sql.push( this.data.where.join(' AND ') );
        if(this.data.orWhere.length) sql.push( sql.length ? 'OR ' + this.data.orWhere.join(' OR ') : this.data.orWhere.join(' OR ') );
        return sql.length ? sql.join(' ') : '';
    }

    havingToSql(){
        let sql = [];
        if(this.data.having.length) sql.push( this.data.having.join(' AND ') );
        if(this.data.orHaving.length) sql.push( sql.length ? 'OR ' + this.data.orHaving.join(' OR ') : this.data.orHaving.join(' OR ') );
        return sql.length ? sql.join(' ') : '';
    }

    /**
     * inner method. wraps string with ``
     * @param {string} field 
     * @returns string
     */
    wrapField(field){
        if(typeof field == 'function') return field();

        return field.split(/[\s]+/).map( word => {

            if(word.match(/^[0-9\.]+$/) || !word.match(/^[A-Za-z0-9_\.-]+$/)) return word; // number or operator
            if(word.toLowerCase() == 'as' || word == '*') return word;

            return word.split('.').map( v => '`' + v + '`' ).join('.');

        }).join(' ');
    }

    /**
     * inner method
     * @param {object} data 
     */
    async getAsSql(data, onlyExisting = false){
        let query = [], columnName, val, dataObj = Object.assign({}, data);
        if(onlyExisting){
            let columns = await this.getColumnNames();
            for(columnName in dataObj) if(columns.indexOf(columnName) == -1) delete dataObj[columnName];
        }
        for(columnName in dataObj){
            val = dataObj[columnName].toString().indexOf('(') == -1 ? this.escape(dataObj[columnName]) : dataObj[columnName];
            query.push( this.wrapField(columnName) + ' = ' + val);
        } 
        return query.join(', ');
    }
    
    when(value, func1, func2 = false){
        if(value) return this.self( func1(this, value) );
        return func2 ? this.self( func2(this, value) ) : this;
    }

    /**
     * truncates table
     */
    truncate(){
        return this.sql('TRUNCATE TABLE ' + this.data.tableName);
    }

    /**
     * drop table
     */
    drop(){
        return this.sql('DROP TABLE ' + this.data.tableName);
    }

    escape(value){
        return this.db.format('?', [value]);
    }

    self(){
        return this;
    }
}
