let routes = {
    "/gist/:gistID": handleGist,
};

function handleGist(gistID) {
    let url = "https://api.github.com/gists/" + gistID;
    $.getJSON(url, parseJSON);
}

function parseJSON(data) {
    let files = data.files;
    let result;
    for (let fileKey in files) {
        result = files[fileKey].content;
    }
    plotLog(parseLog(result));
}

let router = Router(routes);
router.init();