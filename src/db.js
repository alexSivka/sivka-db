
let Query = require('./Query.js');


class db {

    constructor(config = {}){
        this.setConfig(config);
        this.connection = null;
        this.mySql = require('mysql');
        this.ended = false;
    }

    /**
     * @param {string} tableName
     * @returns {object} Query
     */
    table(tableName){
        return new Query(this, tableName);
    }

    /**
     * @param {string} query 
     * @param {array} placeholders
     * @returns {Promise} Promise
     */
    async sql(query, placeholders = {}){
        await this.connect();
        return new Promise( (resolve, reject) => {
            this.connection.query(query, placeholders, (err, result) => {
                if(err) reject(err);
                else resolve(result);
            });
        });
    }

    /**
     * reconnects after calling destroy() or end()
     * @param {object} config 
     * @returns {Promise} Promise
     */

    reConnect(config = null){
        this.destroyed = false;
        return this.connect(config);
    }

    /**
     * connect to base
     * @param {object} [config]
     * @returns {Promise} Promise
     */
    async connect(config = null){
        if(config) this.setConfig(config);
        return new Promise( (resolve, reject) => {

            if(this.destroyed) return reject('connection destroyed');

            if(this.connection && this.connection.state !== 'disconnected' && !config) return resolve(this.connection);
            
            this.connection = this.mySql.createConnection({
                host: this.config.host,
                user: this.config.username,
                password: this.config.password,
                database: this.config.database
            });
            this.connection.on('error', (err) => {
                if(err.code === 'PROTOCOL_CONNECTION_LOST') this.connect();
                else{
                    this.log(err);
                    reject(err);
                }
            });

            this.connection.connect( (err) => {
                if(err){
                    this.log(err);
                    reject(err);
                }else{
                    resolve(this.connection);
                }
            });
        });
    }

    /**
     * escapes string
     * @param {string} str
     * @returns {string}
     */
    async escape(str){
        if(!this.connection || this.connection.state == 'disconnected') await this.connect();
        return this.connection.escape(str);
    }

    /**
     * @param {string} str - sql string
     * @param {array} [values] - values to format 
     * @returns function
     */
    raw(str, values = []){
        return () => { return this.format(str, values) };
    }

    /**
     * @param {string} str - sql string
     * @param {array} [values] - values to format
     * @returns string 
     */
    format(str, values = []){
        return this.mySql.format(str, values);
    }

    /**
     * @param {object} config
     * @returns void
     */
    setConfig(config){
        this.config = config;
    }

    /**
     * destroys connection
     * @returns void
     */
    destroy(){
        this.destroyed = true;
        if(this.connection) this.connection.destroy();
    }

    /**
     * soft destroy, waiting for all queries done
     * @returns {Promise} Promise
     */
    end(){
        this.destroyed = true;
        return new Promise(resolve => {
            if(this.connection) this.connection.end( () => { resolve() });
            else resolve();
        });
    }

    log(){
        if(this.config.debug) console.log(arguments);
    }

}




module.exports = function(config = {}){
    return new db(config);
};