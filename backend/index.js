const express=require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin:['http://localhost:3000']
}));
app.use(express.json()); // to parse json bodies


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));