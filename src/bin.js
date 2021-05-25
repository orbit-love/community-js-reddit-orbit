#!/usr/bin/env node

const OrbitReddit = require('./index.js')
const args = require('yargs').argv

async function main() {
    if(!args.posts || !args.subreddit || !process.env.ORBIT_WORKSPACE_ID || !process.env.ORBIT_API_KEY || !process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET || !process.env.REDDIT_USERNAME || !process.env.REDDIT_PASSWORD) {
        return console.error(`
        You must run this command as follows:
        npx @orbit-love/reddit --posts --subreddit=subreddit-name --hours=24

        If --hours is not provided it will default to 24.

        You must also have ORBIT_WORKSPACE_ID, ORBIT_API_KEY, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, and REDDIT_PASSWORD environment variables set.
        `)
    }

    const orbitReddit = new OrbitReddit()

    let hours
    if(!args.hours) hours = 24
    else if(Number.isNaN(+args.hours)) return console.error(`${args.hours} is not a number`)
    else hours = args.hours

    const posts = await orbitReddit.getPosts({ subreddit: args.subreddit, hours })
    console.log(`Fetched ${posts.length} posts from the provided timeframe`)
    const prepared = await orbitReddit.preparePosts(posts)
    console.log(`Posts are prepared as Orbit activities. Sending them off now...`)
    const response = await orbitReddit.addActivities(prepared)
    console.log(response) // "Added n activities to the workspace-id Orbit workspace"
}

main()