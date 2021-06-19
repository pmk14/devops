const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const express = require('express');

const app = express();

const appId = uuidv4();
const appPort = 5000;

app.use(cors())
app.use(express.json());

app.get('/hello', (req, res) => {
    res.send(`[${appId}] Hello from mybackend server\n\n`);
});

const redis = require('redis');

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    retry_strategy: () => 1000
});

redisClient.on('connect', () =>{
    console.log("Connected to Redis server");
});

const { Pool } = require('pg');

const pgClient = new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    port: process.env.PGPORT

});

pgClient.on('error', () => {
    console.log("Postgres not connected");
});

pgClient.query('CREATE TABLE IF NOT EXISTS flowers2 (id SERIAL PRIMARY KEY, name VARCHAR, color VARCHAR);')
.catch((err) => {
    console.log(err);
});

app.get("/flowers", (req, res) => {
    pgClient.
            query('SELECT * FROM flowers;', (error, result) => {
                if (error) {
                    res.send(error);
                } else {
                    res.send(result.rows);
                }
            });
});

app.get("/flower/:id", (req, res) => {
    var id = req.params.id
    console.log("get");
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

app.listen(appPort, err => {
    console.log(`App listening on port ${appPort}\n\n`);    
});
