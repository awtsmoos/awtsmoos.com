//B"H

export function blobToDataURL(blob) {
  return new Promise(r => {
    var reader = new FileReader();
    reader.onload = function() {
      var dataUrl = reader.result;
      r(dataUrl);
    };
    reader.readAsDataURL(blob);
  });
}
