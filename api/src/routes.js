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

    //API call to retrieve a single user by userName
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

    app.post("/api/users", async (req,res) =>{
        let {id,userName,userEmail,password} = req.body;
        if(!id || !userName || !userEmail || !password){
            return res.status(400).json({message: "Please input all the fields, id, userName, userEmail, and password are needed"});
        }

        try {
            let result = await database.query(
            'INSERT INTO user (id, userName, userEmail, password) VALUES (?,?,?,?)',
            [id,userName,userEmail,password]
            );

            res.status(201).json({
                message: 'User added successfully',
                "id": id,
                "userName":userName,
                "userEmail": userEmail,
                "password":password
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "An error occured while adding the user"});
        }
    })

    //API used to retrieve all items from the reminders table
    app.get("/api/reminders", async (req,res) =>{
        try {
            let query; 
            query = database.query("SELECT * FROM reminders");
            const records = await query;
            res.status(200).send(JSON.stringify(records)).end();
        } catch (error) {
            console.error("Database query failed:", error);
            res.status(500).json({message: "An error occurred while fetching reminders."});
        }
    })

    app.get("/api/reminders/:id", async (req,res) => {
        try {
            let id = req.params.id;
            let query;
            query = database.query("SELECT * FROM reminders WHERE reminder_id = ?",[id]);
            const records = await query;

            if(records.length === 0){
                return res.status(404).json({message: "Reminder not found"})
            }
            res.status(200).send(JSON.stringify(records)).end();
        } catch (error) {
            console.error("Database query failed:", error);
            res.status(500).json({message: "An error ocurred while looking for the reminder"});
        }
    })

    app.post("api/reminders", async (req,res) => {
        let {reminder_id,taskID,reminder_time,created_at} = req.body;
        if(!reminder_id || !taskID || !reminder_time || !created_at){
            return res.status(400).json({message: "Please input all the fields, reminder_id, taskID, reminder_time, and created_at are needed"});
        }
        try {
            
        } catch (error) {
            
        }
    })

}
