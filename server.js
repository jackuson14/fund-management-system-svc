const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware

const app = express();
const PORT = 3000;

app.use(cors()); // Enable CORS for all routes

app.use(bodyParser.json());

// Read data from the CSV file
const fundsData = [];
fs.createReadStream('MutualFunds.csv')
  .pipe(csv())
  .on('data', (row) => {
    fundsData.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed.');
  });

const fundsPriceData = [];
// fs.createReadStream('merged-mutual-funds-prices.csv')
// .pipe(csv())
// .on('data', (row) => {
//     fundsPriceData.push(row);
// })
// .on('end', () => {
// console.log('CSV 2 file successfully processed.');
// });

// REST API endpoints

// Get all funds
app.get('/api/funds', (req, res) => {
  res.json(fundsData);
});

// Get fund by fund_symbol
app.get('/api/funds/:symbol', (req, res) => {
    const fundSymbol = req.params.symbol;
    const fund = fundsData.find((fund) => fund.fund_symbol === fundSymbol);
    if (fund) {
      res.json(fund);
    } else {
      res.status(404).json({ error: 'Fund not found' });
    }
  });

// Get historical fund prices by fund_symbol 
app.get('/api/funds/:symbol/prices', (req, res) => {
    const fundSymbol = req.params.symbol;
    const fundPrices = fundsPriceData.filter((fund) => fund.fund_symbol === fundSymbol);
    if (fundPrices) {
      res.json(fundPrices);
    } else {
      res.status(404).json({ error: 'Fund not found' });
    }
  });

// Create a new fund
app.post('/api/funds', (req, res) => {
  const newFund = req.body;
  fundsData.push(newFund);
  res.status(201).json(newFund);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});