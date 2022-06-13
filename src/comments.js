const moment = require("moment");

function getAllNewComments(client, options) {
  return new Promise(async (resolve, reject) => {
    const { subreddit, hours } = options;
    try {
      let listing = await getInitialComments(client, subreddit);

      let lastPage = false;
      while (!lastPage) {
        listing = await getMorePosts(listing);
        lastPage = isLastPage(listing, hours);
      }

      listing = removeOldPosts(listing, hours);

      resolve(listing);
    } catch (error) {
      reject(error);
    }
  });
}

function getInitialComments(client, subreddit) {
  return new Promise((resolve, reject) => {
    try {
      const options = { limit: 100 };
      client
        .getSubreddit(subreddit)
        .getNewComments(options)
        .then((results) => {
          resolve(results);
        });
    } catch (error) {
      reject(error);
    }
  });
}

function getMorePosts(listing) {
  return new Promise((resolve, reject) => {
    try {
      listing.fetchMore({ amount: 100 }).then((results) => {
        resolve(results);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function isLastPage(listing, hours) {
  const hasOldPosts = listing.find((item) => {
    const d = new Date(item.created_utc * 1000);
    return moment().diff(moment(d), "hours", true) >= hours;
  });
  return hasOldPosts;
}

function removeOldPosts(listing, hours) {
  return listing.filter((item) => {
    const d = new Date(item.created_utc * 1000);
    return moment().diff(moment(d), "hours", true) < hours;
  });
}

const get = (client, options) => {
  return new Promise((resolve, reject) => {
    try {
      getAllNewComments(client, options).then((posts) => {
        resolve(posts);
      });
    } catch (error) {
      reject(error);
    }
  });
};

const prepare = (comments) => {
  return new Promise((resolve) => {
    const p = comments.map((item) => {
      return {
        activity: {
          description: `Post: ${item.link_title}\n\n${item.body}`,
          link: `https://reddit.com${item.permalink}`,
          link_text: `View post on ${item.subreddit_name_prefixed}`,
          title: `Comment in ${item.subreddit_name_prefixed}`,
          tags: ["channel:reddit"],
          activity_type: "reddit:comment",
          key: item.id,
          occurred_at: new Date(item.created_utc * 1000).toISOString(),
        },
        identity: {
          source: "Reddit",
          source_host: "reddit.com",
          username: item.author.name,
          url: `https://reddit.com/u/${item.author.name}`,
        },
      };
    });
    resolve(p);
  });
};

module.exports = {
  get,
  prepare,
};
