/*
Create Context Menu Item for images, videos, and audio
for saving multiples   of the same file
*/
browser.menus.create({
  id: "save-file",
  title:"Save File with (1)...",
  //contexts: ["image","video"]
  contexts: ["all"]
});

// Find out how to get url of image/video/audio and download it
browser.menus.onClicked.addListener((info, tab) => {
  // using menu.onClickData for info
  if (info.menuItemId === "save-file") {

    // findExtension returns array [index, ext] or false
    var media_url = info.srcUrl;
    var media_extension = findExtension(media_url);

    // media_extension is a type of object
    if (typeof(media_extension) === typeof([])) {
      var file = findFilename(media_url, media_extension);
      console.log("    " + media_url + " has an extension: " + media_extension[1]);
      console.log("onClicked - filename is: " + file);
    }
    else {
      console.log(media_url + " does not have an extension");
      var file = findFilenameNoExt(media_url, info.mediaType);
      console.log("onClicked - filename is: " + file);
    }

    // Downloading media
    var downloading = browser.downloads.download({
      url : media_url,
      filename : file
      //conflictAction : uniquify
    });

    downloading.then(onStartedDownload, onFailed)
  }
});

function onStartedDownload(id) {
  console.log("Started downloading: " + id);
}

function onFailed(error) {
  console.log("Download failed: "+ error);
}

// Function to find extensions in urls
//  returning array of index & extension
//  or returning false
function findExtension(url) {
  // returns
  // extensions for images, videos, and audio
  var extensions = ['.jpg', '.png', '.jpeg', '.gif', '.mp4', '.mp3'];

  // Go through all the extensions
  for (let ext of extensions) {
    const index = url.indexOf(ext);
    if (index != -1) {
      return [index, ext];
    }
  }
  return false;
}


function findLastSlash(url){
  // find and index every '/'
  var indices = [];
  for (var i=0; i<url.length; i++){
    if (url[i] === '/') indices.push(i);
  }
  return indices;
}

// After finding extension, find filename in url
function findFilename(url, media_ext) {
  var [index, ext] = media_ext;
  var indices = findLastSlash(url);

  console.log("the indices are: [" + indices + "]");
  console.log("the index of the extension is: [" + index + "]");

  // find highest index of '/' and compare to index of extension in url
  //  if '/' index is less than index of extension
  //  then slash_index will be furthest '/' before extension appears in url
  var slash_index;
  for (var j=indices.length; j>0; j--){
    /*
    starting at back of indices array,
    find the index of '/' that is less than index of extension in url
    once found, this is the '/' right before the name of file and extension
    */
    if (indices[j-1] < index) {
      slash_index = indices[j-1];
      break;
    }
  }

  // filename will be between slash_index and index of extension
  var filename = '';
  for (var k=slash_index+1; k<index; k++) {
    filename += url[k];
  }
  // add extension back onto filename
  filename += " (1)" + ext;
  return filename;
}


function findSpecialCharacters(url){
  // find next special character after last '/'
  var special_characters = ['?', '!', '=', '&', '.'];
  var slash_indices = findLastSlash(url);
  var last_slash = slash_indices[slash_indices.length - 1];

  // for loop to find first special character after last '/'
  var special_index = [];
  for (var y=last_slash; y<url.length; y++) {
    for (var character of special_characters) {
      if (url[y] === character) {
        special_index.push(y);
        break;
      }
    }
    // only need the first special character found
    if (special_index.length != 0) break;
  }
  //console.log("slash index: " +last_slash +" & special index: " +special_index[0]);
  return [last_slash, special_index];
}


function findFileFormat(url){
  // find if url has a format embedded in text
  // default to .jpg format if not found
  // take out special characters if needed (=, !, ?, &)
  // find extension in between last '/' and special characters
  var extensions = ['jpg', 'png', 'jpeg', 'gif'];
  for (let ext of extensions) {
    const index = url.indexOf(ext);
    if (index != -1) {
      var extension = "." + ext;
      console.log('   findFileFormat extension: ' + extension);
      return extension;
      break;
    }
  }
  return '.jpeg';
}

// Without an extension in url, find filename by finding last '/'
// grab text in between last '/' and next special character in url
//  try to find format within url for actual extension
//  if not, assume .jpg extension
function findFilenameNoExt(url, media_type){
  // media_type = info.mediaType
  var filename = '';
  var [slash_index, special_index] = findSpecialCharacters(url);

  // use first special character index
  for (var z=slash_index+1; z<special_index[0]; z++) {
    filename += url[z];
  }

  // add extension onto filename
  if (media_type === 'video') {
    filename += ' (1).mp4';
    console.log('   video filename: ' + filename);
  }
  else if (media_type === 'audio') {
    filename += ' (1).mp3';
    console.log('   audio filename: ' + filename);
  }
  else if (media_type == 'image') {
    filename += ' (1)' + findFileFormat(url);
    console.log('   image filename: ' + filename);
  }
  console.log("new filename: " + filename);
  return filename;
}
