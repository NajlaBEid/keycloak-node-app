
const express = require('express');
const app = express();

app.use(express.static('client'));
const PORT = 9000;

app.listen(PORT, function () {
    console.log(`Server is running on http://localhost:${PORT}`);

});
