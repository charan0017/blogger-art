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

const postOne = {
    input: {
        title: 'My First Blog Post',
        body: '...',
        published: true,
        commentsDisabled: false
    },
    post: undefined
}

const postTwo = {
    input: {
        title: 'My Second Blog Post',
        body: '...',
        published: false,
        commentsDisabled: false
    },
    post: undefined
}

const postThree = {
    input: {
        title: 'My Third Blog Post',
        body: '...',
        published: true,
        commentsDisabled: true
    }
}

const commentOne = {
    input: {
        text: 'This is Fantastic!'
    },
    comment: undefined
}

const commentTwo = {
    input: {
        text: 'Thank you!'
    },
    comment: undefined
}

const seedDatabase = async () => {
    await prisma.mutation.deleteManyComments()
    await prisma.mutation.deleteManyPosts()
    await prisma.mutation.deleteManyUsers()

    userOne.user = await prisma.mutation.createUser({ data: userOne.input })
    userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET)
    userTwo.user = await prisma.mutation.createUser({ data: userTwo.input })
    userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET)

    postOne.post = await prisma.mutation.createPost({
        data: {
            ...postOne.input,
            author: { connect: { id: userOne.user.id } }
        }
    })
    postTwo.post = await prisma.mutation.createPost({
        data: {
            ...postTwo.input,
            author: { connect: { email: userOne.user.email } }
        }
    })
    postThree.post = await prisma.mutation.createPost({
        data: {
            ...postThree.input,
            author: { connect: { email: userOne.user.email } }
        }
    })

    commentOne.comment = await prisma.mutation.createComment({
        data: {
            ...commentOne.input,
            author: { connect: { id: userTwo.user.id } },
            post: { connect: { id: postOne.post.id } }
        }
    })
    commentTwo.comment = await prisma.mutation.createComment({
        data: {
            ...commentTwo.input,
            author: { connect: { id: userOne.user.id } },
            post: { connect: { id: postOne.post.id } }
        }
    })
}

export { userOne, userTwo, postOne, postTwo, postThree, commentOne, commentTwo, seedDatabase as default }
