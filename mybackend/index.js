const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const redis = require('redis');

const redisClient = redis.createClient({
    host: "myredis",
    port: 6379
});

redisClient.on('connect', () => {
    console.log("Connnected to Redis server");
});

const { Pool } = require('pg');

const pgClient = new Pool({
    user: "myappuser",
    password: "1qaz2wsx",
    database: "myappdb",
    host: "mypostgres",
    port: "5432"

});

pgClient.on('error', () => {
    console.log("Postgres not connected");
});

pgClient.query('CREATE TABLE IF NOT EXISTS flowers (id SERIAL PRIMARY KEY, name VARCHAR);')
.catch((err) => {
    console.log(err);
});

app.get("/", (req, res) => {
    res.send("hello world");
});

app.get("/flowers", (req, res) => {
    pgClient.
            query('SELECT * FROM flowers;', (error, result) => {
                if (error) {
                    throw error;
                } else {
                    res.send(result.rows);
                }
            });
});

app.get("/flower/:id", (req, res) => {
    var id = req.params.id

    redisClient.get(id, (err, result) => {
        if (result == null)
        {
            pgClient.
            query('SELECT * FROM flowers WHERE id=' + id + ';')
                .then(result => {res.send('Postgres: ' + result.rows[0].name + '\n')})
                .catch((err) => {console.log(err)});
        }
        else
        {
            res.send('Redis cache: ' + result + '\n');
        }
    });
});

app.delete("/flower/:id", (req, res) => {
    var id = req.params.id

    redisClient.del(id);
    pgClient.query('DELETE FROM flowers WHERE id=' + id + ';')
            .then(res.send("Successfully deleted"))
            .catch((err) => {console.log(err)});
        
});

app.put("/flower", (req, res) => {
    var id = req.body['id'];
    var name = req.body['name'];

    redisClient.set(id, name);
    pgClient.query('UPDATE flowers SET name=\'' + name + '\' WHERE id=' + id + ';')
            .then(res.send(name))
            .catch((err) => {console.log(err)});
        
});

app.post('/flower', (req, res) => {
    var flowerName = req.body['name'];

    pgClient.
    query('INSERT INTO flowers (id, name) VALUES (DEFAULT, \' ' + flowerName + ' \') RETURNING id;')
        .then(result => {redisClient.set(result.rows[0].id, flowerName); console.log(flowerName + " " + result.rows[0].id)})
        .catch((err) => {console.log(err)});

    res.send('Successfully saved: ' + flowerName + '\n');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
});
