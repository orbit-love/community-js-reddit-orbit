/**
 * @jest-environment node
 */

const OrbitReddit = require('../src/index.js')
const REDDIT_POSTS_LISTING = require('./REDDIT_POSTS_LISTING.json')

 beforeAll(() => {
     jest.spyOn(OrbitReddit.prototype, 'getPosts').mockImplementation(options => {
        if(!options) throw new Error('You must provide an options object')
        if(!options.hours) throw new Error('You must provide an hours property')
        if(!options.subreddit) throw new Error('You must provide a subreddit property property')
        return Promise.resolve(REDDIT_POSTS_LISTING)
     })
 })

 describe('client', () => {
     it('initializes with arguments passed in directly', () => {
         envVars(false)
         const orbitReddit = new OrbitReddit('v1', 'v2', 'v3', 'v4', 'v5', 'v6')
         expect(orbitReddit.credentials.orbitWorkspaceId).toBe('v1')
         expect(orbitReddit.credentials.orbitApiKey).toBe('v2')
         expect(orbitReddit.credentials.redditClientId).toBe('v3')
         expect(orbitReddit.credentials.redditClientSecret).toBe('v4')
         expect(orbitReddit.credentials.redditUsername).toBe('v5')
         expect(orbitReddit.credentials.redditPassword).toBe('v6')
     })

     it('initializes with credentials from environment variables', () => {
         envVars(true)
         new OrbitReddit()
     })
 })

  describe('get posts', () => {
      it('returns array', async () => {
          envVars(true)
          const orbitReddit = new OrbitReddit()
          const posts = await orbitReddit.getPosts({ subreddit: 'javascript', hours: 24 })
          expect(Array.isArray(posts)).toBe(true)
     })

     it('requires an object', async () => {
         try {
             const orbitReddit = new OrbitReddit()
             await orbitReddit.getPosts()
             fail()
         } catch(error) {
             expect(String(error).includes('options')).toBeTruthy()
         }
     })

     it('requires a subreddit', async () => {
         try {
             const orbitReddit = new OrbitReddit()
             await orbitReddit.getPosts({ hours: 24 })
             fail()
         } catch(error) {
             expect(String(error).includes('subreddit')).toBeTruthy()
         }
     })

     it('requires hours', async () => {
        try {
            const orbitReddit = new OrbitReddit()
            await orbitReddit.getPosts({ subreddit: 'javascript' })
            fail()
        } catch(error) {
            expect(String(error).includes('hours')).toBeTruthy()
        }
     })
  })

  describe('prepare comments', () => {
      it('returns array of same size as the input', async () => {
          envVars(true)
          const orbitReddit = new OrbitReddit()
          const posts = await orbitReddit.getPosts({ subreddit: 'javascript', hours: 24 })
          const prepared = await orbitReddit.preparePosts(posts)
          expect(posts.length).toEqual(prepared.length)
      })
      it('structure is correct', async () => {
          envVars(true)
          const orbitReddit = new OrbitReddit()
          const posts = await orbitReddit.getPosts({ subreddit: 'javascript', hours: 24 })
          const prepared = await orbitReddit.preparePosts(posts)

          const p = prepared[0]
          expect(p.activity).toBeTruthy()
          expect(p.activity.activity_type).toBe('reddit:post')
          expect(p.activity.title).toBeTruthy()
          expect(p.identity.source_host).toBe('reddit.com')
      })
  })

 function envVars(toHaveVars) {
     if (toHaveVars) {
         process.env.ORBIT_WORKSPACE_ID = '1'
         process.env.ORBIT_API_KEY = '2'
         process.env.REDDIT_CLIENT_ID = '3'
         process.env.REDDIT_CLIENT_SECRET = '4'
         process.env.REDDIT_USERNAME = '5'
         process.env.REDDIT_PASSWORD = '6'
     } else {
        delete process.env.ORBIT_WORKSPACE_ID
        delete process.env.ORBIT_API_KEY
        delete process.env.REDDIT_CLIENT_ID
        delete process.env.REDDIT_CLIENT_SECRET
        delete process.env.REDDIT_USERNAME
        delete process.env.REDDIT_PASSWORD
     }
 }
