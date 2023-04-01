const button = document.querySelector(".dataButton");
const clearStorage = document.querySelector(".clearButton");

button.addEventListener("click", function () {
  const msg = {
    command: "fetchData",
  };
  chrome.runtime.sendMessage(msg, function (response) {
    console.log("haider", response);
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.command === "csvData") {
    let csvData =
      "S.no,channelName,description,channelLink,subscribers,totalViews,totalVideos,email,thirtyDaysViewsCount,country,channelCreationDate,socialLinks,categories\n";

    request.data.forEach((item, index) => {
      const description = item?.description?.replace(/[,\n]/g, "");
      const socialLinks = item?.socialLinks
        ?.toString()
        ?.replace(/[,\n]/g, " - ");
      const categories = item?.categories?.toString()?.replace(/[,\n]/g, " - ");
      const channelCreationDate = item?.channelCreationDate
        ?.toString()
        .replace(/[,]/g, "-");
      let row = `${index + 1},${item?.channelName},${description},${
        item?.channelLink
      },${item?.subscribers},${item?.totalViews},${item?.totalVideos},${
        item?.email
      },${item?.thirtyDaysViewsCount},${item?.country},${
        channelCreationDate ? channelCreationDate : ""
      },${socialLinks ? socialLinks : []},${categories}\n`;
      csvData += row;
    });

    console.log(request);
    console.log(csvData);

    const downloadLink = document.createElement("a");
    const button = document.createElement("button");
    button.textContent = "Download CSV";
    const csvBlob = new Blob([csvData], { type: "text/csv" });
    const csvHref = window.URL.createObjectURL(csvBlob);
    downloadLink.href = csvHref;
    downloadLink.target = "_blank";
    downloadLink.download = "output.csv";
    downloadLink.appendChild(button);
    document.querySelector(".dataContainer").appendChild(downloadLink);

    sendResponse("haider");
  }
});

//-----------------------------------------------------------------------------

clearStorage.addEventListener("click", function () {
  const msg = {
    command: "clearData",
  };
  chrome.runtime.sendMessage(msg, function (response) {
    console.log("haider", response);
  });
});
