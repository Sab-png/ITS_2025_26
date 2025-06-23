// Library Database Setup Script
// Run with: mongosh librarySetup.js

// Clear existing database if it exists
db = db.getSiblingDB('library');
db.dropDatabase();

print('Creating library database...');

// Create collections
db.createCollection('books');
db.createCollection('members');
db.createCollection('loans');

// Create standard indexes first
db.books.createIndex({ "isbn": 1 }, { unique: true });
db.books.createIndex({ "genre": 1 });
db.books.createIndex({ "copies.status": 1 });
db.members.createIndex({ "memberId": 1 }, { unique: true });
db.members.createIndex({ "email": 1 }, { unique: true });
db.loans.createIndex({ "bookId": 1, "returnDate": 1 });
db.loans.createIndex({ "memberId": 1, "status": 1 });

// Create text index (only one per collection allowed)
// We'll create a comprehensive one that includes all searchable fields
db.books.createIndex(
  { 
    "title": "text",
    "authors.name": "text",
    "publisher": "text"
  },
  {
    name: "book_search_index",
    weights: {
      "title": 10,
      "authors.name": 5,
      "publisher": 3
    }
  }
);

print('Indexes created successfully.');

// Insert sample data
const author1 = {
  authorId: new ObjectId(),
  name: "George Orwell",
  nationality: "British"
};

const author2 = {
  authorId: new ObjectId(),
  name: "J.K. Rowling",
  nationality: "British"
};

const author3 = {
  authorId: new ObjectId(),
  name: "Stephen King",
  nationality: "American"
};

const book1 = {
  _id: new ObjectId(),
  isbn: "978-0451524935",
  title: "1984",
  publicationYear: 1949,
  publisher: "Signet Classics",
  genre: ["Dystopian", "Political fiction"],
  authors: [author1],
  copies: [
    {
      copyId: new ObjectId(),
      acquisitionDate: new Date("2015-03-10"),
      status: "available",
      location: "Shelf B2"
    },
    {
      copyId: new ObjectId(),
      acquisitionDate: new Date("2018-07-15"),
      status: "available",
      location: "Shelf B2"
    }
  ]
};

const book2 = {
  _id: new ObjectId(),
  isbn: "978-0747532743",
  title: "Harry Potter and the Philosopher's Stone",
  publicationYear: 1997,
  publisher: "Bloomsbury",
  genre: ["Fantasy", "Adventure"],
  authors: [author2],
  copies: [
    {
      copyId: new ObjectId(),
      acquisitionDate: new Date("2010-05-22"),
      status: "available",
      location: "Shelf C1"
    },
    {
      copyId: new ObjectId(),
      acquisitionDate: new Date("2019-11-05"),
      status: "on loan",
      location: "Shelf C1"
    }
  ]
};

const book3 = {
  _id: new ObjectId(),
  isbn: "978-1501142970",
  title: "It",
  publicationYear: 1986,
  publisher: "Scribner",
  genre: ["Horror", "Thriller"],
  authors: [author3],
  copies: [
    {
      copyId: new ObjectId(),
      acquisitionDate: new Date("2017-09-01"),
      status: "available",
      location: "Shelf A3"
    }
  ]
};

db.books.insertMany([book1, book2, book3]);

// Insert members
const member1 = {
  _id: new ObjectId(),
  memberId: "M1001",
  firstName: "Alice",
  lastName: "Johnson",
  email: "alice.johnson@example.com",
  phone: "+1555123456",
  address: {
    street: "123 Oak Street",
    city: "Springfield",
    zip: "12345"
  },
  membershipStart: new Date("2020-01-15"),
  active: true
};

const member2 = {
  _id: new ObjectId(),
  memberId: "M1002",
  firstName: "Bob",
  lastName: "Williams",
  email: "bob.williams@example.com",
  phone: "+1555234567",
  address: {
    street: "456 Maple Avenue",
    city: "Springfield",
    zip: "12345"
  },
  membershipStart: new Date("2021-03-22"),
  active: true
};

db.members.insertMany([member1, member2]);

// Insert loans
const loan1 = {
  _id: new ObjectId(),
  bookId: book2._id,
  copyId: book2.copies[1].copyId,
  memberId: member1._id,
  loanDate: new Date("2023-01-05"),
  dueDate: new Date("2023-01-19"),
  returnDate: null,
  status: "on loan"
};

const loan2 = {
  _id: new ObjectId(),
  bookId: book1._id,
  copyId: book1.copies[0].copyId,
  memberId: member2._id,
  loanDate: new Date("2022-12-10"),
  dueDate: new Date("2022-12-24"),
  returnDate: new Date("2022-12-20"),
  status: "returned"
};

db.loans.insertMany([loan1, loan2]);

print('Sample data inserted successfully.');

// Verification queries
print("\nDatabase stats:");
printjson(db.stats());

print("\nBook count:");
printjson(db.books.countDocuments());

print("\nMember count:");
printjson(db.members.countDocuments());

print("\nLoan count:");
printjson(db.loans.countDocuments());

print("\nSetup completed successfully!");