// Data Structure dan Event Setup
const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS'


// DOM CONTENT LOADED
document.addEventListener('DOMContentLoaded', function () {
  const bookSubmit = document.getElementById('inputBook');

  bookSubmit.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});


// Utility Functions
function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}


const isStorageExist = () => {
  if (typeof (Storage) === undefined) {
    alert('Browser tidak mendukung local storage');
    return false;
  }
  return true;
}


// SAVE DATA
const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}


// LOAD DATA
const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: { searchQuery: books } }));
}


// MAKE BOOK
function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const textTitle = document.createElement('h2');
  textTitle.innerText = title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Penulis: ${author}`;

  const textYear = document.createElement('p');
  textYear.innerText = `Tahun: ${year}`;

  const textContainer = document.createElement('div');
  textContainer.classList.add('action');

  textContainer.append(textTitle, textAuthor, textYear);
  textContainer.setAttribute('id', `book-${id}`)


  const article = document.createElement('article');
  article.classList.add('book_item');
  article.append(textTitle, textAuthor, textYear, textContainer);


  if (isComplete) {
    const greenButton = document.createElement('button');
    greenButton.classList.add('green');
    greenButton.innerText = 'Belum selesai dibaca';

    greenButton.addEventListener('click', function () {
      undoBookFromComplete(bookObject.id);
    });

    const redButton = document.createElement('button');
    redButton.classList.add('red');
    redButton.innerText = 'Hapus Buku';

    redButton.addEventListener('click', function () {
      removeBookFromComplete(bookObject.id);
    });
    textContainer.append(greenButton, redButton);

  } else {

    const greenButton = document.createElement('button');
    greenButton.classList.add('green');
    greenButton.innerText = 'Selesai dibaca';

    greenButton.addEventListener('click', function () {
      addBookToComplete(bookObject.id);
    });

    const redButton = document.createElement('button');
    redButton.classList.add('red')
    redButton.innerText = 'Hapus Buku';

    redButton.addEventListener('click', function () {
      removeBookFromComplete(bookObject.id);
    });

    textContainer.append(greenButton, redButton)
  }
  return article;
}


// ADD BOOK
function addBook() {
  const bookTitle = document.getElementById('inputBookTitle').value;
  const bookAuthor = document.getElementById('inputBookAuthor').value;
  const bookYear = parseInt(document.getElementById('inputBookYear').value);

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, false);
  books.push(bookObject);

  document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: { searchQuery: books } }));
  saveData();
}


// UPDATE BOOK STATUS
function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;
  bookTarget.isComplete = true;

  document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: { searchQuery: books } }));
  saveData();
}


function removeBookFromComplete(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);

  document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: { searchQuery: books } }));
  saveData();
}

function undoBookFromComplete(bookId) {

  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;
  bookTarget.isComplete = false;

  document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: { searchQuery: books } }));
  saveData();
}


function findBook(bookId) {
  for (bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}


function findBookIndex(bookId) {
  for (index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}


// RENDER BOOK
document.addEventListener(RENDER_EVENT, function (event) {

  const displayBooks = event.detail.searchQuery;
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  const completeBookshelfList = document.getElementById('completeBookshelfList');

  incompleteBookshelfList.innerHTML = '';
  completeBookshelfList.innerHTML = '';

  for (const bookItem of displayBooks) {
    const bookElement = makeBook(bookItem);

    if (!bookItem.isComplete) {
      incompleteBookshelfList.append(bookElement);
    } else {
      completeBookshelfList.append(bookElement);
    }
  }
});




// Search Book Feature
const searchSubmit = document.getElementById('searchSubmit');

searchSubmit.addEventListener('click', function (event) {
  event.preventDefault();

  const searchBookTitle = document.getElementById('searchBookTitle').value.toLowerCase();

  if (searchBookTitle === '') {
    document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: { searchQuery: books } }));

  } else {

    const filteredBooks = books.filter(function (key) {
      return key.title.toLowerCase().includes(searchBookTitle);
    })
    document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: { searchQuery: filteredBooks } }))
  }
}
);

