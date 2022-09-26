const appKey = "qArvQkCHajrDvxyPeWVwkJNguHq5dl5c";
const serviceUrl = "https://api.giphy.com/v1/gifs/search?";
const serviceTrend = "https://api.giphy.com/v1/gifs/trending?";
const inputSearch = document.getElementById("searchGifs");

let store = [];
let defaultOffset = 0;
let offset = "";
let fetching = true;
let lastSearch = "";

document.querySelector("#history").addEventListener("click", (event) => {
  event.preventDefault();
  clearResult();
  const select = event.target.innerText;
  lastSearch = select;
  cargarGifs(serviceUrl, appKey, select);
});

document.querySelector("#loadGifs").addEventListener("click", (event) => {
  event.preventDefault();
  clearResult();
  let value = inputSearch.value;
  lastSearch = value;
  if (value.trim()) {
    cargarGifs(serviceUrl, appKey, value);
  }
 
});

const saveStore = (search) => {
  if (store.includes(search)) {
    let tempStore = [search, ...store];
    window.localStorage.setItem("searchs", JSON.stringify(store));
  } else {
    let tempStore = [];
    // const tempStore = Object.assign(search,store);
    store.push(search);
    if (store.length > 3) {
      store.shift();
    }
    tempStore = [...store];
    window.localStorage.setItem("searchs", JSON.stringify(tempStore));
    addHistory(tempStore);
  }
};

const addHistory = (el) => {
  document.getElementById("history").innerHTML = "";
  el.forEach((elemento) => {
    const li = `
    <button  type="button" class="list-group-item list-group-item-action" value="${elemento}">${elemento}</button >`;
    document.getElementById("history").insertAdjacentHTML("beforeend", li);
  });
};

const addCard = (data) => {
  data.forEach((el) => {
    const contenedor = document.createElement("div");
    contenedor.className = "col-lg-3 col-md-4 col-sm-12 pb-sm-0 pb-lg-4";
    let card = `
    <div class="card" >
      <img src="${el.urlImage}" class="card-img-top" alt="${el.titulo}">
    </div>`;
    contenedor.insertAdjacentHTML("beforeend", card);
    document.querySelector("#contain").appendChild(contenedor);
  });
};
const noResult = (search) => {
  let result = `
  <div class="alert alert-danger" role="alert">
     No hay resultados para su búsqueda ${search}
   </div>`;
  document.querySelector("#contain").insertAdjacentHTML("beforeend", result);
};

const cargarGifs = async (url, key, search, limit) => {
  fetching = true;
  if (search) {
    saveStore(search);
  }
  getGifs(url, key, search, limit)
    .then((response) => {
      if (response.length > 0) {
        const data = response.map((el) => {
          return { titulo: el.title, urlImage: el.images.original.url };
        });
        addCard(data);
      } else {
        noResult(search);
      }
    })
    .finally(() => {
      setTimeout(() => {
        fetching = false;
      }, 500);
    });
};

const getGifs = async (url, key, search = "", limitApi = 0) => {
  const params = {
    api_key: key,
    limit: 20,
    offset: limitApi ? limitApi : defaultOffset,
    q: search,
  };
  let query = Object.keys(params)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
    .join("&");
  const response = await fetch(`${url}${query}`);
  const gifs = await response.json();
  return gifs.data;
};

const storage = new Promise((resolve, reject) => {
  if (window.localStorage.getItem("searchs")) {
    store = JSON.parse(window.localStorage.getItem("searchs"));
    addHistory(store);
    resolve(store);
  } else {
    document.getElementById("history").insertAdjacentHTML("beforeend", 'no hay busquedas previas');
    store = [];
    resolve(store);
  }
});

const clearResult = () => {
  document.getElementById("contain").innerHTML = "";
  defaultOffset = 0;
};

window.onload = async () => {
  storage
    .then(() => {
      cargarGifs(serviceTrend, appKey, "", "");
    })
    .catch((e) => {});
};
window.addEventListener("scroll", () => {
  if (fetching) return;
  if (window.scrollY + window.innerHeight >= document.body.offsetHeight) {
    let offset = 15;
    defaultOffset = defaultOffset + offset;
    if (lastSearch != "") {
      cargarGifs(serviceUrl, appKey, lastSearch, defaultOffset);
    } else {
      cargarGifs(serviceTrend, appKey);
    }
  }
});
