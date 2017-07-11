const express = require('express');
const app = express();

app.use(express.static('dist'));
app.listen(9111, function(){
    console.log('listening port 9111');
});
