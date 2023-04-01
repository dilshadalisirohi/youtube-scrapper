chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request, sender);
  if (request.command === "clearData") {
    chrome.storage.local.remove("data", function () {});
    console.log("data removed");
  }

  if (request.command === "fetchData") {
    chrome.storage.local.get(["data"], function (result) {
      console.log("Value currently is " + result?.data);

      chrome.runtime.sendMessage(
        { command: "csvData", data: result?.data },
        function (response) {}
      );
      sendResponse();
    });
  }
});
