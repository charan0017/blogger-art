import 'cross-fetch/polyfill'

import prisma from '../src/prisma'
import getClient from './utils/get-client'
import seedDatabase, { userOne, userTwo, postOne, postTwo, commentOne , commentTwo } from './utils/seed-database'
import { getComments, createComment, updateComment, deleteComment, subscribeToComments } from './utils/operations'

jest.setTimeout(15000)

const client = getClient()

beforeEach(seedDatabase)

test('Should create a comment', async () => {
    const client = getClient(userTwo.jwt)
    const variables = {
        data: {
            text: 'I would like to see more of these kind',
            post: postOne.post.id
        }
    }
    const { data } = await client.mutate({ mutation: createComment, variables })
    const { createComment: comment } = data
    expect(comment).toBeTruthy()
    expect(comment.id).toBeTruthy()
    expect(comment.text).toBe(variables.data.text)
    expect(comment.post).toBeTruthy()
    expect(comment.post.id).toBe(postOne.post.id)
})

test('Should not create comment on a draft post', async () => {
    const client = getClient(userTwo.jwt)
    const variables = {
        data: {
            text: 'I enjoyed reading it',
            post: postTwo.post.id
        }
    }
    await expect(
        client.mutate({ mutation: createComment, variables })
    ).rejects.toThrow()
})

test('Should update comment', async () => {
    const client = getClient(userTwo.jwt)
    const variables = {
        id: commentOne.comment.id,
        data: {
            text: 'This is Fantastic!!'
        }
    }
    const { data } = await client.mutate({ mutation: updateComment, variables })
    const { updateComment: comment } = data
    expect(comment).toBeTruthy()
    expect(comment.id).toBe(commentOne.comment.id)
    expect(comment.text).toBe(variables.data.text)
})

test('Should not update another users comment', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: commentOne.comment.id,
        data: {
            text: 'This is Fantastic!!'
        }
    }
    await expect(
        client.mutate({ mutation: updateComment, variables })
    ).rejects.toThrow()
})

test('Should not delete another users comment', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: commentOne.comment.id
    }
    await expect(
        client.mutate({ mutation: deleteComment, variables })
    ).rejects.toThrow()
})

test('Should require authentication to create a comment', async () => {
    const variables = {
        data: {
            text: 'I would like to see more of these kind',
            post: postOne.post.id
        }
    }
    await expect(
        client.mutate({ mutation: createComment, variables })
    ).rejects.toThrow()
})

test('Should require authentication to update a comment', async () => {
    const variables = {
        id: commentOne.comment.id,
        data: {
            text: 'This is Fantastic!!'
        }
    }
    await expect(
        client.mutate({ mutation: updateComment, variables })
    ).rejects.toThrow()
})

test('Should require authentication to delete a comment', async () => {
    const variables = {
        id: commentOne.comment.id
    }
    await expect(
        client.mutate({ mutation: deleteComment, variables })
    ).rejects.toThrow()
})

test('Should delete own comment', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: commentTwo.comment.id
    }
    await client.mutate({ mutation: deleteComment, variables })
    const commentExists = await prisma.exists.Comment({ id: commentTwo.comment.id })
    expect(commentExists).toBeFalsy()
})

test('Should not delete other user comment', async () => {
    const client = getClient(userOne.jwt)
    const variables = {
        id: commentOne.comment.id
    }
    await expect(
        client.mutate({ mutation: deleteComment, variables })
    ).rejects.toThrow()
    const commentExists = await prisma.exists.Comment({ id: commentOne.comment.id })
    expect(commentExists).toBeTruthy()
})

test('Should fetch post comments', async () => {
    const { data } = await client.query({ query: getComments })
    expect(Array.isArray(data.comments)).toBeTruthy()
    expect(data.comments.length).toBe(2)
})

test('Should subscribe to comments for a post', async (done) => {
    const variables = {
        postId: postOne.post.id
    }
    client.subscribe({ query: subscribeToComments, variables }).subscribe({
        next: (request) => {
            expect(request.data.comment.mutation).toBe('DELETED')
            done()
        }
    })
    await prisma.mutation.deleteComment({ where: { id: commentOne.comment.id } })
})
