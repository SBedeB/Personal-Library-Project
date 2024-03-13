const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('Routing tests', function() {

    // Test POST /api/books with a title
    suite('POST /api/books with title => create book object/expect book object', function() {

      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({title: 'Test Book'})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.equal(res.body.title, 'Test Book');
            done();
          });
      });

      // Test POST /api/books without providing a title
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title');
            done();
          });
      });

    });

    // Test GET /api/books to retrieve an array of all books
    suite('GET /api/books => array of books', function(){

      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            // Check if the books array contains necessary properties
            assert.property(res.body[0], 'commentcount');
            assert.property(res.body[0], 'title');
            assert.property(res.body[0], '_id');
            done();
          });
      });      

    });

    // Tests for GET /api/books/[id] with both valid and invalid id
    suite('GET /api/books/[id] => book object with [id]', function(){

      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/invalidId')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            const bookId = res.body[0]._id;
            chai.request(server)
              .get(`/api/books/${bookId}`)
              .end(function(err, res){
                assert.equal(res.status, 200);
                // Check for comments, title, and _id in the book object
                assert.property(res.body, 'comments');
                assert.property(res.body, 'title');
                assert.property(res.body, '_id');
                done();
              });
          });
      });

    });

    // Tests for POST /api/books/[id] to add a comment to a book
    suite('POST /api/books/[id] => add comment/expect book object with id', function(){

      test('Test POST /api/books/[id] with comment', function(done){
        // Assuming a book is already present from the previous tests
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            const bookId = res.body[0]._id;
            chai.request(server)
              .post(`/api/books/${bookId}`)
              .send({comment: 'Test Comment'})
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.isArray(res.body.comments);
                // Verify the comment was added
                assert.include(res.body.comments, 'Test Comment');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .post('/api/books/invalidId')
          .send({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post('/api/books/invalidId')
          .send({comment: 'Test Comment'})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

    });

    // Tests for DELETE /api/books/[id] to delete a specific book
    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        // Create a book to delete
        chai.request(server)
          .post('/api/books')
          .send({title: 'Book to Delete'})
          .end(function(err, res){
            const bookId = res.body._id;
            chai.request(server)
              .delete(`/api/books/${bookId}`)
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.text, 'delete successful');
                done();
              });
          });
      });

      test('Test DELETE /api/books/[id] with id not in db', function(done){
        chai.request(server)
          .delete('/api/books/invalidId')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

    });

  });

});
