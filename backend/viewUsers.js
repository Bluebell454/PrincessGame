const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://127.0.0.1:27017");

async function viewUsers() {
    try {
        await client.connect();
        const db = client.db("gameDB");
        const users = await db.collection("users").find().toArray();
        console.log("Users in database:");
        console.table(users);
        await client.close();
    } catch (err) {
        console.error(err);
    }
}

viewUsers();