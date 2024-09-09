const sql = require("mssql");
const express = require("express");
const app = express();
const port = 3000;
app.listen(port,()=>{
    console.log(`server is running on ${port}`);
})
app.use(express.json());
const config = {
    server: 'localhost',          // Use 'localhost' or '127.0.0.1' (no instance name)
    port: 1433,                   // Ensure the correct port is used, or find dynamic port from SQL Server Configuration Manager
    user: '//',
    password: '//',
    database: 'BlogsDB',
    options: {
        enableArithAbort: true,
        trustServerCertificate: true // Required for self-signed certificates or local dev
    },
    connectionTimeout: 30000,      // Increase connection timeout for slow networks
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

sql.on('error', err => {
    console.log(err.message);
});

async function getDbUSerAsyncFunction(req, res) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query("SELECT * FROM Blogs");

        // Send the result as a JSON response
        res.status(200).json({ result: result.recordset }); // recordset contains the data
        pool.close();
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: 'Error fetching data', error: error.message });
    }
}

// API route to get blog records
app.get('/api/getRecords', getDbUSerAsyncFunction);

 app.post('/api/insertBlogs',async (req,res)=>{
    const { Name,Description,Author}=req.body;
    if((Name==null || Name=="")&&(Description==null || Description == "")&&(Author==null ||Author=="")){
        res.status(400).send({message:"Please fill all the fields"});
    }
    else{
        const pool = await sql.connect(config);
        const result = await pool.request()
        .input('Name', sql.NVarChar, Name)
        .input('Description', sql.NVarChar, Description)
        .input('Author', sql.NVarChar, Author)
        .query('INSERT INTO Blogs (Name, Description, Author) VALUES (@Name, @Description, @Author)');
        res.status(200).send({message:"Blog inserted successfully"});
        sql.close();
        // const result = await pool.request().query(`INSERT INTO Blogs (Name,Description,Author) values(${Name},${Description},${Author})
    }

})
