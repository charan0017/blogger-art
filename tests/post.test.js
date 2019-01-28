import 'cross-fetch/polyfill'

import prisma from '../src/prisma'
import getClient from './utils/get-client'
import seedDatabase, { userOne, postOne, postTwo } from './utils/seed-database';
import { getPosts, myPosts, updatePost, createPost, deletePost, subscribeToPosts } from './utils/operations'

jest.setTimeout(15000)

const client = getClient()

beforeEach(seedDatabase)

test('Should expose published posts', async () => {
    const response = await client.query({ query: getPosts })
    expect(Array.isArray(response.data.posts)).toBeTruthy()
    expect(response.data.posts.length).toBe(1)
    expect(response.data.posts[0].published).toBeTruthy()
})

test('Should fetch myPosts', async () => {
    const client = getClient(userOne.jwt)
    const { data } = await client.query({ query: myPosts })
    expect(Array.isArray(data.myPosts)).toBeTruthy()
    expect(data.myPosts.length).toBe(2)
})

test('Should be able to update own post', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: postOne.post.id,
        data: { published: false }
    }
    const { data } = await client.mutate({ mutation: updatePost, variables })
    const postExists = await prisma.exists.Post({ id: postOne.post.id, published: false })
    expect(data.updatePost.published).toBeFalsy()
    expect(postExists).toBeTruthy()
})

test('Should create a new post', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        data: {
            title: 'My Third Post',
            body: '...',
            published: true,
            commentsDisabled: false
        }
    }
    const { data } = await client.mutate({ mutation: createPost, variables })
    const postExists = await prisma.exists.Post({ id: data.createPost.id })
    expect(postExists).toBeTruthy()
})

test('Should delete post', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: postTwo.post.id
    }
    await client.mutate({ mutation: deletePost, variables })
    const postExists = await prisma.exists.Post({ id: postTwo.post.id })
    expect(postExists).toBeFalsy()
})

test('Should subscribe to changes for post', async (done) => {
    client.subscribe({ query: subscribeToPosts }).subscribe({
        next: (request) => {
            expect(request.data.post.mutation).toBe('DELETED')
            done()
        }
    })
    await prisma.mutation.deletePost({ where: { id: postOne.post.id } })
})
