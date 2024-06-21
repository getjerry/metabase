const dbConfig = {
  name: "metabase",
  version: 1,
  objectStoreName: "dictionaryStore",
};

// open or create indexed database
export const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbConfig.name, dbConfig.version);

    request.onerror = function (event) {
      console.error("open database error:", event.target.errorCode);
      reject(event.target.error);
    };

    request.onupgradeneeded = function (event) {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(dbConfig.objectStoreName)) {
        db.createObjectStore(dbConfig.objectStoreName, { keyPath: "key" });
      }
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      resolve(db);
    };
  });
};

export const storeDataInDB = data => {
  return new Promise((resolve, reject) => {
    openDatabase()
      .then(db => {
        const transaction = db.transaction(
          [dbConfig.objectStoreName],
          "readwrite",
        );
        const objectStore = transaction.objectStore(dbConfig.objectStoreName);

        // add data
        const addRequest = objectStore.add({ id: 1, metadata: data });

        addRequest.onsuccess = function (event) {
          resolve("data storaging IndexedDB！");
        };

        addRequest.onerror = function (error) {
          console.error("data storage IndexedDB error:", error);
          reject(error);
        };

        transaction.oncomplete = function () {
          db.close();
        };
      })
      .catch(error => {
        console.error("open database error:", error);
        reject(error);
      });
  });
};

// get indexdb data
export const getDataFromId = id => {
  return new Promise((resolve, reject) => {
    openDatabase()
      .then(db => {
        const transaction = db.transaction(
          [dbConfig.objectStoreName],
          "readonly",
        );
        const objectStore = transaction.objectStore(dbConfig.objectStoreName);
        const getRequest = objectStore.get(id);

        getRequest.onsuccess = function (event) {
          const metadata = event.target.result;
          if (metadata) {
            resolve(metadata);
          } else {
            reject(`can not find id = ${id} data`);
          }
        };

        getRequest.onerror = function (error) {
          console.error("get data fron IndexedDB error:", error);
          reject(error);
        };

        transaction.oncomplete = function () {
          db.close();
        };
      })
      .catch(error => {
        console.error("open database error:", error);
        reject(error);
      });
  });
};

export const insertOrUpdateData = (id, data) => {
  return new Promise((resolve, reject) => {
    openDatabase()
      .then(db => {
        const transaction = db.transaction(
          [dbConfig.objectStoreName],
          "readwrite",
        );
        const objectStore = transaction.objectStore(dbConfig.objectStoreName);
        const putRequest = objectStore.put({ key: id, ...data });

        putRequest.onsuccess = function () {
          resolve();
        };

        putRequest.onerror = function (event) {
          console.error("insert or update data error:", event.target.errorCode);
          reject(event.target.error);
        };

        transaction.oncomplete = function () {
          db.close();
        };
      })
      .catch(error => {
        console.error("open database error:", error);
        reject(error);
      });
  });
};

// close database
export const closeDatabase = db => {
  db.close();
};
