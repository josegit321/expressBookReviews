const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

// Wraps a lookup in a Promise so each route resolves its result asynchronously
const findBooks = (predicate) => new Promise((resolve) => {
  const result = {};
  Object.keys(books).forEach(isbn => {
    if (predicate(books[isbn])) result[isbn] = books[isbn];
  });
  resolve(result);
});

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  new Promise((resolve) => resolve(books))
    .then(allBooks => res.status(200).send(JSON.stringify(allBooks, null, 4)));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => books[isbn] ? resolve(books[isbn]) : reject(isbn))
    .then(book => res.status(200).json(book))
    .catch(() => res.status(404).json({ message: `Book with ISBN ${isbn} not found` }));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  findBooks(book => book.author.toLowerCase() === author).then(result => {
    if (Object.keys(result).length === 0) {
      return res.status(404).json({ message: `No books found by author ${req.params.author}` });
    }
    return res.status(200).json(result);
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  findBooks(book => book.title.toLowerCase() === title).then(result => {
    if (Object.keys(result).length === 0) {
      return res.status(404).json({ message: `No books found with title ${req.params.title}` });
    }
    return res.status(200).json(result);
  });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
  return res.status(200).json(books[isbn].reviews);
});

// Tasks 10-13: the same lookups done with async/await and Axios

// Task 10: get all books
public_users.get('/async/books', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Task 11: get book details by ISBN
public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${req.params.isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: "Error fetching book by ISBN", error: error.message });
  }
});

// Task 12: get book details by author
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: "Error fetching books by author", error: error.message });
  }
});

// Task 13: get book details by title
public_users.get('/async/title/:title', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(req.params.title)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    return res.status(status).json({ message: "Error fetching books by title", error: error.message });
  }
});

module.exports.general = public_users;
