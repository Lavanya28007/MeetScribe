const express= require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const UserRouter = require('./routers/UserRouter');
// const SumRouter = require('./routers/SumRouter');
const aiRouter = require('./routers/aiRouter');
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin:'*'
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use('/user', UserRouter);
// app.use('/sum', SumRouter);
app.use('/api/ai', aiRouter);


app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));