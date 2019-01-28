import 'cross-fetch/polyfill'

import prisma from '../src/prisma'
import getClient from './utils/get-client'
import seedDatabase, { userOne, userTwo, postOne, postTwo } from './utils/seed-database'
import { getPosts, myPosts, getPostById, updatePost, createPost, deletePost, subscribeToPosts } from './utils/operations'

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

test('Should not be able to update another users post', async () => {
    const client = getClient(userTwo.jwt)
    const variables = {
        id: postOne.post.id,
        data: { commentsDisabled: true }
    }
    await expect(
        client.mutate({ mutation: updatePost, variables })
    ).rejects.toThrow()
})

test('Should not be able to delete another users post', async () => {
    const client = getClient(userTwo.jwt)
    const variables = {
        id: postOne.post.id
    }
    await expect(
        client.mutate({ mutation: deletePost, variables })
    ).rejects.toThrow()
})

test('Should require authentication to create post', async () => {
    const variables = {
        data: {
            title: 'My Third Post',
            body: '...',
            published: true,
            commentsDisabled: false
        }
    }
    await expect(
        client.mutate({ mutation: createPost, variables })
    ).rejects.toThrow()
})

test('Should require authentication to update post', async () => {
    const variables = {
        id: postOne.post.id,
        data: { commentsDisabled: true }
    }
    await expect(
        client.mutate({ mutation: updatePost, variables })
    ).rejects.toThrow()
})

test('Should require authentication to delete post', async () => {
    const variables = {
        id: postOne.post.id
    }
    await expect(
        client.mutate({ mutation: deletePost, variables })
    ).rejects.toThrow()
})

test('Should fetch published post by id', async () => {
    const variables = {
        id: postOne.post.id
    }
    const { data } = await client.query({ query: getPostById, variables })
    const { post: postData } = data
    expect(postData).toBeTruthy()
    expect(postData.id).toBe(postOne.post.id)
    expect(postData.title).toBe(postOne.post.title)
    expect(postData.body).toBe(postOne.post.body)
    expect(postData.published).toBe(postOne.post.published)
    expect(postData.commentsDisabled).toBe(postOne.post.commentsDisabled)
})

test('Should fetch own draft post by id', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: postTwo.post.id
    }
    const { data } = await client.query({ query: getPostById, variables })
    const { post: postData } = data
    expect(postData).toBeTruthy()
    expect(postData.id).toBe(postTwo.post.id)
    expect(postData.title).toBe(postTwo.post.title)
    expect(postData.body).toBe(postTwo.post.body)
    expect(postData.published).toBe(postTwo.post.published)
    expect(postData.commentsDisabled).toBe(postTwo.post.commentsDisabled)
})

test('Should not fetch draft post from other user', async () => {
    const client = getClient(userTwo.jwt)
    const variables = {
        id: postTwo.post.id
    }
    await expect(
        client.query({ query: getPostById, variables })
    ).rejects.toThrow()
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
