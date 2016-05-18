let routes = {
    "/gist/:gistID": handleGist,
};

function handleGist(gistID) {
    $("#file_drop").hide();
    let url = "https://api.github.com/gists/" + gistID;
    $("body").addClass("loading");
    $.getJSON(url, parseJSON);
}

function parseJSON(data) {
    let files = data.files;
    let result;
    for (let fileKey in files) {
        result = files[fileKey].content;
    }
    $("body").removeClass("loading");
    plotLog(parseLog(result));
}

let router = Router(routes);
router.init();