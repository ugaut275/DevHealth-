module.exports.register = (app, database) => {

    app.get('/', async (req, res) => {
        res.status(200).send("This is running!").end();
    });

    app.get("api/users", async (req,res) => {
        try {
            let query;
            query = database.query('SELECT * FROM user');
            const records = await query;
            res.status(200).send(JSON.stringify(records)).end();

        } catch (error) {
            console.error("Database query failed:", error);
            res.status(500).json({message: "An error occurred while fetching items."});
        }
    })


}