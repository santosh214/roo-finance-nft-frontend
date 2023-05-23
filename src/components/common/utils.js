export const convertBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    // if (file && file.type.match("image.*")) {

    // }
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (err) => {
      reject(err);
    };
  });
};

export const getJSON = function (url) {
  return new Promise(async (resolve, reject) => {
    var xhr = await new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    await xhr.send();
    xhr.onload = function () {
      var status = xhr.status;
      // console.log("xhr.response", xhr.response);
      if (status == 200) {
        resolve(xhr.response);
      }
      // else {
      //   reject(status);
      // }
    };
  });
};