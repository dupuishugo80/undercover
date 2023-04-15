const http = require('http');

async function getRandomWord() {
  const url = 'http://localhost:7777/word';

  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

module.exports = { getRandomWord };