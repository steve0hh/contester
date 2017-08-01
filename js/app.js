// https://contester.surge.sh/
var app = new Vue({
  el: '#contester',
  data: {
    url: '',
    progress: 0,
    progress_message: ""
  },
  methods: {
    loginFacebook: function(){
      FB.login(function(response) {
        if (response.authResponse) {
          console.log('Welcome!  Fetching your information.... ');
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      });
    },
    downloadLikes: function(){
      doRequest(this.url, getLikes);
    },
    downloadComments: function(){
      doRequest(this.url, getComments);
    }
  }
});

// validates, gets the object id, then runs the callback
// function with objectid supplied
function doRequest(url, callback){
  console.log("Ensure that you have done Step 1.");
  var postRegex = /https:\/\/www\.facebook\.com\/([^\/]*)\/posts\/([0-9]*)/
  var videoPhotoRegex = /https:\/\/www\.facebook\.com\/.*\/([0-9]+)\/.*/

  var postRegexMatch = url.match(postRegex)
  var videoPhotoRegexMatch = url.match(videoPhotoRegex)
  console.log(videoPhotoRegexMatch)
  // match regex, validation stage
  if (postRegexMatch != null){
    var pageName = postRegexMatch[1];
    var postId = postRegexMatch[2];
    FB.api(
      '/' +pageName,
      function(response) {
        var pageId = response.id;
        var objectId = pageId + "_" + postId;
        console.log(objectId);
        // run the callback function
        callback(objectId);
      }); // close fb.api
  }else if (videoPhotoRegexMatch != null){
    var objectId = videoPhotoRegexMatch[1];
    console.log(objectId)
    callback(objectId);
  } else {
    // doesn't match any of the above regex
    alert("Sorry, there's a problem with the supplied URL")
  } // close else

} // close doRequest

function getComments(objectId){
  var comments = []
  FB.api(
    "/"+ objectId +"/comments",
    'GET',
    {"limit":"1000", "summary": "true"},
    function parse(response) {
      if (response && !response.error) {
        /* handle the result */
        comments = comments.concat(response.data)
        console.log(comments.length)

        app.progress = Math.round((comments.length/response.summary.total_count) * 100);
        app.progress_message = app.progress + " %";

        if (typeof response.paging == "undefined" || typeof response.paging.next == "undefined") {

          app.progress_message = "Generating CSV file";

          csv = CSV.encode(comments);
          uriContent = "data:application/octet-stream," + encodeURIComponent(csv);
          var element = document.createElement('a');
          element.setAttribute('href', uriContent);
          element.setAttribute('download', 'comments.csv');
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
          app.progress = 0;
          return
        }
        FB.api(response.paging.next, parse);
      }else{
        console.log("failed")
      }
    }
  );
}

function getLikes(objectId){
  var likes = []
  FB.api(
    "/"+ objectId +"/likes",
    'GET',
    {"limit":"1000", "summary": "true"},
    function parse(response) {
      if (response && !response.error) {
        /* handle the result */
        likes = likes.concat(response.data)
        console.log(likes.length)

        app.progress = Math.round((likes.length/response.summary.total_count) * 100);
        app.progress_message = app.progress + " %";

        if (typeof response.paging == "undefined" || typeof response.paging.next == "undefined") {
          app.progress_message = "Generating CSV file";
          csv = CSV.encode(likes);
          uriContent = "data:application/octet-stream," + encodeURIComponent(csv);
          var element = document.createElement('a');
          element.setAttribute('href', uriContent);
          element.setAttribute('download', 'likes.csv');
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
          app.progress = 0;
          return
        }

        FB.api(response.paging.next, parse);
      }else{
        console.log("failed")
      }
    }
  );
}

