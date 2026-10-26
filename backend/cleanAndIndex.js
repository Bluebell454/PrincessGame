const { MongoClient } = require("mongodb");

const client = new MongoClient("mongodb://127.0.0.1:27017");

async function cleanAndIndex() {
    try {
        await client.connect();
        const db = client.db("gameDB");
        const users = db.collection("users");

        console.log("🧹 Removing duplicate users...");

        // Find duplicates by email
        const duplicateEmails = await users.aggregate([
            { $group: { _id: "$email", ids: { $push: "$_id" }, count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();

        for (const dup of duplicateEmails) {
            const idsToDelete = dup.ids.slice(1); // keep first
            await users.deleteMany({ _id: { $in: idsToDelete } });
            console.log(`Removed duplicate email: ${dup._id}`);
        }

        // Find duplicates by username
        const duplicateNames = await users.aggregate([
            { $group: { _id: "$name", ids: { $push: "$_id" }, count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]).toArray();

        for (const dup of duplicateNames) {
            const idsToDelete = dup.ids.slice(1); // keep first
            await users.deleteMany({ _id: { $in: idsToDelete } });
            console.log(`Removed duplicate username: ${dup._id}`);
        }

        console.log("✅ Duplicates removed!");

        // Create unique indexes
        await users.createIndex({ email: 1 }, { unique: true });
        await users.createIndex({ name: 1 }, { unique: true });

        console.log("✅ Unique indexes created on email and username!");

        await client.close();
    } catch (err) {
        console.error(err);
    }
}

cleanAndIndex();