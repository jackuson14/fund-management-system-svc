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
const portfolioFundsData = [];
const fundsPriceData = [];
fs.createReadStream('MutualFunds.csv')
  .pipe(csv())
  .on('data', (row) => {
    fundsData.push(row);
  })
  .on('end', () => {
    console.log('1 CSV file successfully processed.');
    //dummy data
    portfolioFundsData.push(fundsData[0])
    portfolioFundsData.push(fundsData[1])
    portfolioFundsData.push(fundsData[2])
  });
fs.createReadStream('MutualFundsPrices.csv')
.pipe(csv())
.on('data', (row) => {
    fundsPriceData.push(row);
})
.on('end', () => {
console.log('2 CSV files successfully processed.');
});

// REST API endpoints

// Get all funds with pagination
app.get('/api/funds', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedFunds = fundsData.slice(startIndex, endIndex);

  res.json({
    totalItems: fundsData.length,
    page,
    pageSize,
    funds: paginatedFunds,
  });
});

// Get portfolio funds with pagination
app.get('/api/funds/portfolio', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  const paginatedFunds = portfolioFundsData.slice(startIndex, endIndex);

  res.json({
    totalItems: portfolioFundsData.length,
    page,
    pageSize,
    funds: paginatedFunds,
  });
});

// search query returns a list of funds
app.get('/api/funds/search', (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required.' });
  }

  const filteredList = fundsData.filter(item => item.fund_long_name.toLowerCase().includes(query.toLowerCase()));

  res.json(filteredList);
});

// Get historical fund prices by fund_symbol 
app.get('/api/funds/:symbol', (req, res) => {
  const fundSymbol = req.params.symbol;
  const fundData = fundsData.filter((fund) => fund.fund_symbol === fundSymbol);
  if (fundData) {
    res.json(fundData);
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