module.exports.register = (app, database) => {

    app.get('/', async (req, res) => {
        res.status(200).send("This is running!").end();
    });

    //API call to retrieve all the users in the user table
    app.get("/api/users", async (req,res) => {
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

    //API call to retrieve a single user by ID 
    app.get("/api/users/:id", async (req,res) => {
        try {
            let id = req.params.id;
            let query;
            query = database.query("SELECT * FROM user WHERE id = ?",[id])
            const records = await query;

            if(records.length === 0){
                return res.status(404).json({message: "User not found"});
            }
            res.status(200).send(JSON.stringify(records)).end();
        } catch (error) {
            console.error("Database query failed:", error);
            res.status(500).json({message: "An error ocurred while looking for the user"});
        }
    })

    app.get("/api/users/name/:name", async (req,res) =>{
        try {
            let name = req.params.name;
            let query;
            query = database.query("SELECT * FROM user WHERE userName = ?",[name]);
            const records = await query;

            if(records.length === 0){
                return res.status(404).json({message: "User not found"})
            }
            res.status(200).send(JSON.stringify(records)).end();
        } catch (error) {
            console.error("Database query failed: ",error);
            res.status(500).json({message: "An error occured while looking for the user"});
        }
    })


}
