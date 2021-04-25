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

pgClient.query('CREATE TABLE IF NOT EXISTS flowers (id SERIAL PRIMARY KEY, name VARCHAR, color VARCHAR);')
.catch((err) => {
    console.log(err);
});

app.get("/hello", (req, res) => {
    res.send("hello world!!!\n");
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
                .then(result => {res.send('Postgres: ' + result.rows[0].id + " " + result.rows[0].name +  " " + result.rows[0].color + '\n')})
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
    var color = req.body['color'];

    redisClient.set(id, (id + " " + name + " " + color));
    pgClient.query('UPDATE flowers SET name=\'' + name + '\', color=\'' + color + '\' WHERE id=' + id + ';')
            .then(res.send(id + " " + name + " " + color))
            .catch((err) => {console.log(err)});
        
});

app.post('/flower', (req, res) => {
    var flowerName = req.body['name'];
    var flowerColor = req.body['color'];

    pgClient.
    query('INSERT INTO flowers (id, name, color) VALUES (DEFAULT, \'' + flowerName + '\', \'' + flowerColor + '\') RETURNING id;')
        .then(result => {redisClient.set(result.rows[0].id, (result.rows[0].id + " " + flowerName + " " + flowerColor)); console.log(flowerName + " " + result.rows[0].id)})
        .catch((err) => {console.log(err)});

    res.send('Successfully saved: ' + flowerName + '\n');
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
});
