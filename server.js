const express =  require('express');
const path  = require('path');

const app = express();

app.use(express.static('./dist/FUSE2'));

app.route("/*", (req, res) => {
  res.sendFile(path.join(__dirname, './dist/FUSE2/index.html'))
});

app.listen(process.env.PORT || 5000);
