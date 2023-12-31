import errorImgSrc from "/src/img/alert.svg";

const input = document.getElementById("default-search");
const searchButton = document.getElementById("search-button");
const searchResult = document.getElementById("search-result");

//fetch dei libri e modifica dell'array 'books'
async function caricaLibri() {
  let books = [];
  while (searchResult.firstChild) {
    searchResult.removeChild(searchResult.firstChild);
  }
  await fetch(
    `https://openlibrary.org/subjects/${input.value.toLowerCase()}.json?limit=18`,
  )
    .then((response) => response.json())
    .then((data) => {
      data.works.forEach((element, i) => {
        let authors = [];
        element.authors.forEach((author) => {
          authors.push(author.name);
        }),
          (books[i] = {
            title: element.title,
            authors: authors,
            year: element.first_publish_year,
            key: element.key,
            coverId: element.cover_id,
          });
      });
    });
  return books;
}

//fetch delle descrizioni dei libri
async function findDescription(book) {
  await fetch(`https://openlibrary.org${book.key}.json`)
    .then((response) => response.json())
    .then((data) => {
      if (typeof data.description == "string") {
        book.description = data.description;
      } else if (
        typeof data.description == "object" &&
        data.description !== undefined
      ) {
        book.description = data.description.value;
      } else {
        book.description = "no description found";
      }
    });
}

//funzione che crea le card dei libri
async function createCard(book) {
  await findDescription(book);
  const card = document.createElement("div");
  card.className = ` m-4 grid grid-cols-2 cursor-pointer items-center rounded-lg border border-gray-200 bg-white shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 md:max-w-xl sm:text-sm`;
  const img = document.createElement("img");
  img.className = `h-48 w-32 rounded-l-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-s-lg `;
  img.src = `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`;
  img.alt = `${book.title}`;
  const textDiv = document.createElement("div");
  textDiv.classList = `flex flex-col justify-between p-3 leading-normal dark:text-gray-200`;
  const title = document.createElement("h3");
  title.textContent = `${book.title}`;
  title.classList = "font-bold text-lg";
  const authors = document.createElement("h4");
  if (book.authors[1]) {
    authors.textContent = `${book.authors.join(", ")}`;
  } else {
    authors.textContent = `${book.authors[0]}`;
  }
  authors.classList = "font-semibold text-base";
  const publishYear = document.createElement("h5");
  publishYear.textContent = `${book.year}`;
  const description = document.createElement("div");
  description.className =
    "col-span-2 break-words text-wrap text-justify hidden transition-all text-xs p-2 text-balance dark:text-gray-200";
  const descriptionText = document.createElement("p");
  descriptionText.className = "text-balance";
  descriptionText.textContent = `${book.description}`;
  searchResult.appendChild(card);
  card.appendChild(img);
  card.appendChild(textDiv);
  textDiv.appendChild(title);
  textDiv.appendChild(authors);
  textDiv.appendChild(publishYear);
  card.appendChild(description);
  description.appendChild(descriptionText);

  //event listener per ogni card che mostra la descrizione sul click
  card.addEventListener("click", () => {
    if (description.classList.contains("hidden")) {
      description.classList.remove("hidden");
    } else {
      description.classList.add("hidden");
    }
  });
}

//event listener sul bottone 'search'
searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  const loader = document.getElementById("loader");
  loader.style.display = "block";
  caricaLibri()
    .then(
      (books) => (
        (loader.style.display = "none"),
        books.length == 0
          ? displayError()
          : books.forEach((book) => {
              createCard(book);
            })
      ),
    )
    .catch(
      (err) => (
        (loader.style.display = "none"),
        displayError(),
        console.error("Errore nel caricamento dei libri", err)
      ),
    );
});

// Funzione che mostra il simbolo di errore con la relativa scritta
function displayError() {
  const errorDiv = document.createElement("div");
  errorDiv.className =
    "my-20 flex w-40 flex-col items-center justify-center md:w-56 lg:col-span-2";
  const errorImg = document.createElement("img");
  errorImg.src = errorImgSrc;
  errorDiv.appendChild(errorImg);
  const errorText = document.createElement("h1");
  errorText.textContent = "Nessun libro trovato";
  errorText.className = "whitespace-nowrap text-xl font-bold md:text-2xl";
  errorDiv.appendChild(errorText);
  searchResult.appendChild(errorDiv);
}
