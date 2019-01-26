import 'cross-fetch/polyfill'

import prisma from '../src/prisma'
import getClient from './utils/get-client'
import seedDatabase, { userOne } from './utils/seed-database';
import { createUser, getUsers, login, getUserProfile } from './utils/operations'

jest.setTimeout(15000)

const client = getClient()

beforeEach(seedDatabase)

test('Should create new user', async () => {
    const variables = {
        data: {
            name: 'PaperTown',
            email: 'paper@example.com',
            password: 'abc12345',
            age: 22
        }
    }
    const response = await client.mutate({ mutation: createUser, variables })
    const userExists = await prisma.exists.User({ id: response.data.createUser.user.id })
    expect(userExists).toBeTruthy()
})

test('Should expose public author profiles', async () => {
    const response = await client.query({ query: getUsers })
    expect(Array.isArray(response.data.users)).toBeTruthy()
    expect(response.data.users.length).toBe(2)
    expect(response.data.users[0].email).toBe(null)
    expect(response.data.users[0].name).toBe(userOne.user.name)
})

test('Should not login with wrong credentials', async () => {
    const variables = {
        data: {
            email: userOne.input.email,
            password: 'wrong_password'
        }
    }
    await expect(
        client.mutate({ mutation: login, variables })
    ).rejects.toThrow()
})

test('Should not sign-up with invalid password', async () => {
    const variables = {
        data: {
            name: 'PaperTown',
            email: 'paper@example.com',
            password: 'abc',
            age: 22
        }
    }
    await expect(
        client.mutate({ mutation: createUser, variables })
    ).rejects.toThrow()
})

test('Should fetch user profile', async () => {
    const client = getClient(userOne.jwt)
    const { data } = await client.query({ query: getUserProfile })
    expect(data.me.id).toBe(userOne.user.id)
    expect(data.me.name).toBe(userOne.user.name)
    expect(data.me.email).toBe(userOne.user.email)
})
