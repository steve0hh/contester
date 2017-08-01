var app = new Vue({
  el: '#contester',
  data: {
    url: '',
    error: false
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
      if (this.validateUrl()) doRequest(this.url, getLikes);
      else alert("Sorry, there's a problem with the supplied URL")
    },
    downloadComments: function(){
      if (this.validateUrl()) doRequest(this.url, getComments);
      else alert("Sorry, there's a problem with the supplied URL")
    },
    validateUrl: function() {
      var url = this.url
      var url_parts = url.split("/")
      if (url_parts.length != 6) {
        return false
      }
      return true
    }
  }
});

function doRequest(url, callback){
  var url_parts = url.split("/");
  var pageName = url_parts[3];
  var postId = url_parts[url_parts.length - 1];

  // get the facebook id first
  FB.api(
    '/' +pageName,
    function(response) {
      var pageId = response.id;
      console.log(pageId);
      console.log(postId);
      // run the callback function
      callback(pageId, postId);
    }
  );
}


function getComments(pageId, postId){
  var comments = []
  FB.api(
    "/"+ pageId +"_"+ postId +"/comments",
    'GET',
    {"limit":"1000"},
    function parse(response) {
      if (response && !response.error) {
        /* handle the result */
        comments = comments.concat(response.data)
        console.log(comments)
        if (!response.paging.next) {
          csv = CSV.encode(comments);
          uriContent = "data:application/octet-stream," + encodeURIComponent(csv);
          var element = document.createElement('a');
          element.setAttribute('href', uriContent);
          element.setAttribute('download', 'comments.csv');
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
          return
        }

        FB.api(response.paging.next, parse);
      }else{
        console.log("failed")
      }
    }
  );
}

function getLikes(pageId, postId){
  var likes = []
  FB.api(
    "/"+ pageId +"_"+ postId +"/likes",
    'GET',
    {"limit":"1000"},
    function parse(response) {
      if (response && !response.error) {
        /* handle the result */
        likes = likes.concat(response.data)
        console.log(likes)
        if (!response.paging.next) {
          csv = CSV.encode(likes);
          uriContent = "data:application/octet-stream," + encodeURIComponent(csv);
          var element = document.createElement('a');
          element.setAttribute('href', uriContent);
          element.setAttribute('download', 'likes.csv');
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
          return
        }

        FB.api(response.paging.next, parse);
      }else{
        console.log("failed")
      }
    }
  );
}

