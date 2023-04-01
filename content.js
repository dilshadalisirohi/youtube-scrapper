const addButton = document.createElement("button");
const container = document.getElementById("channel-header-container");
addButton.classList.add("extensionAddButton");
addButton.innerHTML = "Add channel";
document.body.appendChild(addButton);
let today = new Date();
let prior = new Date(new Date().setDate(today.getDate() - 30));
const thirtyDays = prior.toISOString().split(".")[0] + "-07:00";

addButton.addEventListener("click", () => {
  const email = prompt("Enter email");
  console.log(email);
  const metaTag = document.querySelector('[itemprop="channelId"]');

  const channelId = metaTag.getAttribute("content");
  console.log(channelId);

  const apiKey = "API-KEY-HERE";
  const baseUri = "https://www.googleapis.com/youtube/v3/channels?";

  const fetchData = async (url) => {
    const responseApi = await fetch(url);
    return responseApi.json();
  };

  const promises = [
    fetchData(
      `${baseUri}id=${channelId}&key=${apiKey}&part=snippet,contentDetails,statistics,id,status,topicDetails`
    ),
  ];
  Promise.all(promises)
    .then(async (data) => {
      const thirtyDaysViewsCount = await fetchData(
        `https://www.googleapis.com/youtube/v3/activities?channelId=${channelId}&key=${apiKey}&publishedAfter=${thirtyDays}&maxResults=50&part=contentDetails`
      ).then(async (response) => {
        const newArray = response.items.map((item) => {
          return item?.contentDetails?.upload?.videoId;
        });

        const views = await fetchData(
          `https://www.googleapis.com/youtube/v3/videos?id=${newArray.toString()}&key=${apiKey}&maxResults=50&part=statistics`
        ).then((data) => {
          const sum = data?.items?.reduce((partialSum, a) => {
            return Number(partialSum) + Number(a?.statistics?.viewCount);
          }, 0);

          return sum;
        });

        return views;
      });

      const joinedDate = document.querySelector(
        "#right-column > yt-formatted-string:nth-child(2) > span:nth-child(2)"
      );
      const linkList = document.querySelectorAll("#link-list-container > a");
      const socialLinks = Array.from(linkList).map((item) => {
        return item.href;
      });

      const displayData = {
        channelName: data[0]?.items[0]?.snippet?.title,
        description: data[0]?.items[0]?.snippet?.description,
        channelLink: location.href.substring(0, location.href.lastIndexOf("/")),
        country: data[0]?.items[0]?.snippet?.country,
        subscribers: data[0]?.items[0]?.statistics?.subscriberCount,
        totalViews: data[0]?.items[0]?.statistics?.viewCount,
        totalVideos: data[0]?.items[0]?.statistics?.videoCount,
        email: email,
        thirtyDaysViewsCount: thirtyDaysViewsCount,
        categories: data[0]?.items[0]?.topicDetails?.topicCategories?.map(
          (categorie) => {
            return categorie.split("/")[categorie.split("/").length - 1];
          }
        ),
        socialLinks: socialLinks.map((item) => {
          const link = new URL(item);
          return link.searchParams.get("q");
        }),
        channelCreationDate: joinedDate?.textContent
          ? oinedDate?.textContent
          : "",
      };
      console.log(displayData);

      chrome.storage.local.get(["data"], function (result) {
        console.log("dataSet", result.data);
        if (result.data === undefined) {
          chrome.storage.local.set({ data: [displayData] }, function () {
            console.log("Value is set");
          });
        } else {
          chrome.storage.local.set(
            { data: [...result.data, displayData] },
            function () {
              console.log("Value is set");
            }
          );
        }
      });
    })
    .catch((err) => console.log(err));
});
