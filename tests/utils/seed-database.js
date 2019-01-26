import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import prisma from '../../src/prisma'

const userOne = {
    input: {
        name: 'SaiCharan',
        email: 'saicharan@example.com',
        password: bcrypt.hashSync('abc12345'),
        age: 22
    },
    user: undefined,
    jwt: undefined
}

const userTwo = {
    input: {
        name: 'Vani',
        email: 'vani@example.com',
        password: bcrypt.hashSync('abc12345')
    },
    user: undefined,
    jwt: undefined
}

const seedDatabase = async () => {
    await prisma.mutation.deleteManyUsers()

    userOne.user = await prisma.mutation.createUser({ data: userOne.input })
    userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET)
    userTwo.user = await prisma.mutation.createUser({ data: userTwo.input })
    userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET)
}

export { userOne, userTwo, seedDatabase as default }
