const pkg = require("../package.json");
const posts = require("./posts");
const comments = require("./comments");
const snoowrap = require("snoowrap");
const OrbitActivities = require("@orbit-love/activities");

class OrbitReddit {
  constructor(orbitWorkspaceId, orbitApiKey, redditClientId, redditClientSecret, redditUsername, redditPassword) {
    this.credentials = this.checkCredentials(
      orbitWorkspaceId,
      orbitApiKey,
      redditClientId,
      redditClientSecret,
      redditUsername,
      redditPassword
    );
    this.orbit = new OrbitActivities(
      this.credentials.orbitWorkspaceId,
      this.credentials.orbitApiKey,
      `community-js-reddit-orbit/${pkg.version}`
    );
    this.reddit = new snoowrap({
      userAgent: `orbit.love community integration run by ${this.credentials.redditUsername}`,
      clientId: this.credentials.redditClientId,
      clientSecret: this.credentials.redditClientSecret,
      username: this.credentials.redditUsername,
      password: this.credentials.redditPassword,
    });
  }

  checkCredentials(OrbitWorkspaceId, OrbitApiKey, RedditClientId, RedditClientSecret, RedditUsername, RedditPassword) {
    const orbitWorkspaceId = OrbitWorkspaceId || process.env.ORBIT_WORKSPACE_ID;
    const orbitApiKey = OrbitApiKey || process.env.ORBIT_API_KEY;
    const redditClientId = RedditClientId || process.env.REDDIT_CLIENT_ID;
    const redditClientSecret = RedditClientSecret || process.env.REDDIT_CLIENT_SECRET;
    const redditUsername = RedditUsername || process.env.REDDIT_USERNAME;
    const redditPassword = RedditPassword || process.env.REDDIT_PASSWORD;

    if (
      !orbitWorkspaceId ||
      !orbitApiKey ||
      !redditClientId ||
      !redditClientSecret ||
      !redditUsername ||
      !redditPassword
    ) {
      throw new Error(
        "You must initialize the OrbitReddit package with: orbitWorkspaceId, orbitApiKey, redditClientId, redditClientSecret, redditUsername, redditPassword"
      );
    } else {
      return { orbitWorkspaceId, orbitApiKey, redditClientId, redditClientSecret, redditUsername, redditPassword };
    }
  }

  getPosts(options) {
    if (!options) throw new Error("You must provide an options object");
    if (!options.hours) throw new Error("You must provide an hours property");
    if (!options.subreddit) throw new Error("You must provide a subreddit property");
    return posts.get(this.reddit, options);
  }

  preparePosts(list) {
    return posts.prepare(list);
  }

  getComments(options) {
    if (!options) throw new Error("You must provide an options object");
    if (!options.hours) throw new Error("You must provide an hours property");
    if (!options.subreddit) throw new Error("You must provide a subreddit property");
    return comments.get(this.reddit, options);
  }

  prepareComments(list) {
    return comments.prepare(list);
  }

  addActivities(activities) {
    return new Promise(async (resolve, reject) => {
      try {
        let stats = { added: 0, duplicates: 0, errors: [] };
        for (let activity of activities) {
          await this.orbit
            .createActivity(activity)
            .then(() => {
              stats.added++;
            })
            .catch((err) => {
              if (err.errors && err.errors.key) stats.duplicates++;
              else {
                stats.errors.push(err);
              }
            });
        }
        resolve(stats);
      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = OrbitReddit;
