const Express = require('express');
const app = Express();
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Express routes
const routes = require("./routes.js");

app.use(morgan('tiny'));
app.use(cors());

app.use(Express.json());

app.use(routes);

app.listen(PORT, () => {
    console.log(`API ejecutandose en el puerto ${PORT} ✅`);
})