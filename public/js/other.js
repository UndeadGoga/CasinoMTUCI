const {Pool} = require("pg");
const onSubmitReg = () => {
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'details',
        password: 'postgres',
        port: 5432,
    });

    pool.query("UPDATE cas_users set balance = $1", [theClient.balance])
    exitRoom()
}