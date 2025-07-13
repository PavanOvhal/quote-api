const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const quotesFilePath = path.join(__dirname, 'quotes.json');

let quotes = [];

// Load quotes from JSON file
function loadQuotes() {
  if (fs.existsSync(quotesFilePath)) {
    const data = fs.readFileSync(quotesFilePath, 'utf-8');
    quotes = JSON.parse(data);
  } else {
    quotes = [
      { id: 1, text: "Believe in yourself, bro!", author: "Pavan" },
      { id: 2, text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
      { id: 3, text: "Do or do not. There is no try.", author: "Yoda" }
    ];
    saveQuotes();
  }
}

// Save quotes to JSON file
function saveQuotes() {
  fs.writeFileSync(quotesFilePath, JSON.stringify(quotes, null, 2));
}

loadQuotes();

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Quote API!');
});

app.get('/api/quotes', (req, res) => {
  res.json(quotes);
});

app.get('/api/quotes/random', (req, res) => {
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  res.json(random);
});

app.get('/api/quotes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const quote = quotes.find(q => q.id === id);
  if (quote) {
    res.json(quote);
  } else {
    res.status(404).json({ message: 'Quote not found' });
  }
});

app.post('/api/quotes', (req, res) => {
  const { text, author } = req.body;

  if (!text || !author) {
    return res.status(400).json({ message: 'Text and author are required' });
  }

  const newQuote = {
    id: quotes.length > 0 ? quotes[quotes.length - 1].id + 1 : 1,
    text,
    author
  };

  quotes.push(newQuote);
  saveQuotes();

  res.status(201).json({ message: 'Quote added successfully', quote: newQuote });
});

// ✅ Bulk quote upload route
app.post('/api/quotes/bulk', (req, res) => {
  const newQuotes = req.body;

  if (!Array.isArray(newQuotes)) {
    return res.status(400).json({ message: 'Expected an array of quotes' });
  }

  const startingId = quotes.length > 0 ? quotes[quotes.length - 1].id + 1 : 1;

  const processedQuotes = newQuotes.map((quote, index) => {
    if (!quote.text || !quote.author) {
      return null; // skip invalid
    }

    return {
      id: startingId + index,
      text: quote.text,
      author: quote.author
    };
  }).filter(q => q !== null); // Remove nulls

  quotes.push(...processedQuotes);
  saveQuotes();

  res.status(201).json({
    message: `${processedQuotes.length} quotes added successfully`,
    quotes: processedQuotes
  });
});

app.listen(PORT, () => {
  console.log(`✅ Quote API running at http://localhost:${PORT}`);
});
