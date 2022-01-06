#!/usr/bin/env node

const OrbitReddit = require("./index.js");
const args = require("yargs").argv;
require("dotenv").config();

async function main() {
  if (
    (!args.posts && !args.comments) ||
    !args.subreddit ||
    !process.env.ORBIT_WORKSPACE_ID ||
    !process.env.ORBIT_API_KEY ||
    !process.env.REDDIT_CLIENT_ID ||
    !process.env.REDDIT_CLIENT_SECRET ||
    !process.env.REDDIT_USERNAME ||
    !process.env.REDDIT_PASSWORD
  ) {
    return console.error(`
        You must run this command as follows:
        npx @orbit-love/reddit --posts|comments --subreddit=subreddit-name --hours=24

        If --hours is not provided it will default to 24.

        You must also have ORBIT_WORKSPACE_ID, ORBIT_API_KEY, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, and REDDIT_PASSWORD environment variables set.
        `);
  }

  const orbitReddit = new OrbitReddit();

  let hours;
  if (!args.hours) hours = 24;
  else if (Number.isNaN(+args.hours)) return console.error(`${args.hours} is not a number`);
  else hours = args.hours;

  if (args.posts) {
    let posts = await orbitReddit.getPosts({ subreddit: args.subreddit, hours });
    if (args.filter)
      posts = posts.filter((p) => {
        const inTitle = p.title.toLowerCase().includes(args.filter.toLowerCase());
        const inBody = p.selftext.toLowerCase().includes(args.filter.toLowerCase());
        const inUrl = p.url.toLowerCase().includes(args.filter.toLowerCase());
        return inTitle || inBody || inUrl;
      });
    console.log(`Fetched ${posts.length} posts from the provided timeframe`);
    const prepared = await orbitReddit.preparePosts(posts);
    console.log(`Posts are prepared as Orbit activities. Sending them off now...`);
    const response = await orbitReddit.addActivities(prepared);
    console.log(JSON.stringify(response, null, 2)); // "Added n activities to the workspace-id Orbit workspace"
  }

  if (args.comments) {
    let comments = await orbitReddit.getComments({ subreddit: args.subreddit, hours });
    if (args.filter) {
      comments = comments.filter((c) => {
        const inTitle = c.link_title.toLowerCase().includes(args.filter.toLowerCase());
        const inBody = c.body.toLowerCase().includes(args.filter.toLowerCase());
        return inTitle || inBody;
      });
    }
    console.log(`Fetched ${comments.length} comments from the provided timeframe`);
    const prepared = await orbitReddit.prepareComments(comments);
    console.log(`Comments are prepared as Orbit activities. Sending them off now...`);
    const response = await orbitReddit.addActivities(prepared);
    console.log(JSON.stringify(response, null, 2)); // "Added n activities to the workspace-id Orbit workspace"
  }
}

main();
