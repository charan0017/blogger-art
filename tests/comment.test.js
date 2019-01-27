import 'cross-fetch/polyfill'

import prisma from '../src/prisma'
import getClient from './utils/get-client'
import seedDatabase, { userOne, postOne, commentOne , commentTwo } from './utils/seed-database';
import { deleteComment, subscribeToComments } from './utils/operations'

jest.setTimeout(15000)

const client = getClient()

beforeEach(seedDatabase)

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
