'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
// Connect to MongoDB using URI from .env file
mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

// Schema for books, includes title and an array of comments
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: [String]
});

// Model from schema
const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {

  // Route to get all books, return array including comment counts
  app.route('/api/books')
    .get(function (req, res){
      // Find all books and map to include comment count
      Book.find({}, (err, books) => {
        if (err) res.send(err);
        const result = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        }));
        res.json(result);
      });
    })

    // Route to add a new book with a title
    .post(function (req, res){
      const title = req.body.title;
      if (!title) {
        return res.send('missing required field title');
      }
      const newBook = new Book({ title, comments: [] });
      newBook.save((err, savedBook) => {
        if (err) res.send(err);
        res.json({ _id: savedBook._id, title: savedBook.title });
      });
    })

    // Route to delete all books
    .delete(function(req, res){
      Book.deleteMany({}, (err) => {
        if (err) res.send(err);
        res.send('complete delete successful');
      });
    });

  // Route for operations on a specific book by id
  app.route('/api/books/:id')
    .get(function (req, res){
      const bookId = req.params.id;
      // Find book by id and return it with comments
      Book.findById(bookId, (err, book) => {
        if (err || !book) return res.send('no book exists');
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      });
    })

    // Route to add a comment to a specific book
    .post(function(req, res){
      const bookId = req.params.id;
      const comment = req.body.comment;
      if (!comment) {
        return res.send('missing required field comment');
      }
      // Add comment to the book and return updated book
      Book.findByIdAndUpdate(bookId, {$push: {comments: comment}}, {new: true}, (err, updatedBook) => {
        if (err || !updatedBook) return res.send('no book exists');
        res.json({ _id: updatedBook._id, title: updatedBook.title, comments: updatedBook.comments });
      });
    })

    // Route to delete a specific book by id
    .delete(function(req, res){
      const bookId = req.params.id;
      Book.findByIdAndDelete(bookId, (err, deletedBook) => {
        if (err || !deletedBook) return res.send('no book exists');
        res.send('delete successful');
      });
    });

};
