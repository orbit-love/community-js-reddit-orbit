const moment = require('moment')

function getAllNewPosts(client, options) {
    return new Promise(async (resolve, reject) => {
        const { subreddit, hours } = options
        try {
            let listing = await getInitialPosts(client, subreddit)

            let lastPage = false
            while(!lastPage) {
                listing = await getMorePosts(listing)
                lastPage = isLastPage(listing, hours)
            }

            listing = removeOldPosts(listing, hours)

            resolve(listing)
        } catch(error) {
            reject(error)
        }
    })
}

function getInitialPosts(client, subreddit) {
    return new Promise((resolve, reject) => {
        try {
            const options = { limit: 100 }
            client.getSubreddit(subreddit).getNew(options).then(results => {
                resolve(results)
            })
        } catch(error) {
            reject(error)
        }
    })
}

function getMorePosts(listing) {
    return new Promise((resolve, reject) => {
        try {
            listing.fetchMore({ amount: 100 }).then(results => {
                resolve(results)
            })
        } catch(error) {
            reject(error)
        }
    })
}

function isLastPage(listing, hours) {
    const hasOldPosts = listing.find(item => {
        const d = new Date(item.created_utc*1000)
        return moment().diff(moment(d), 'hours', true) >= hours
    })
    return hasOldPosts
}

function removeOldPosts(listing, hours) {
    return listing.filter(item => {
        const d = new Date(item.created_utc*1000)
        return moment().diff(moment(d), 'hours', true) < hours
    })
}

const get = (client, options) => {
    return new Promise((resolve, reject) => {
        try {
            getAllNewPosts(client, options).then(posts => {
                resolve(posts)
            })
        } catch(error) {
            reject(error)
        }
    })
}

const prepare = posts => {
    return posts.map(item => {
        return {
            activity: {
                description: `Title: ${item.title}`,
                link: `https://reddit.com${item.permalink}`,
                link_text: `View post on ${item.subreddit_name_prefixed}`,
                title: `Posted to ${item.subreddit_name_prefixed}`,
                activity_type: 'reddit:post',
                key: `reddit-post-${item.author.name}-${item.created_utc}`,
                occurred_at: new Date(item.created_utc*1000).toISOString()
            },
            identity: {
                source: 'Reddit',
                source_host: 'reddit.com',
                username: item.author.name,
                url: `https://reddit.com/u/${item.author.name}`,
                uid: item.author_fullname
            }
        }
    })
}

module.exports = {
    get,
    prepare
}
