const express= require('express');
const app = express();
const cors = require('cors');
const UserRouter = require('./routers/UserRouter');
require('dotenv').config();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin:['http://localhost:3000']
}));
app.use(express.json()); // to parse json bodies
app.use('/user', UserRouter);




app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));