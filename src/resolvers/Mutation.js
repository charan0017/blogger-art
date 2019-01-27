import bcrypt from 'bcryptjs'

import { getUserId, generateToken, hashPassword } from '../utils'

const Mutation = {
    createUser: async (parent, { data }, { prisma }, info) => {
        const password = await hashPassword(data.password)
        const user = await prisma.mutation.createUser({
            data: {
                ...data,
                password
            }
        })
        return {
            user,
            token: generateToken(user.id)
        }
    },
    login: async (parent, { data }, { prisma }, info) => {
        const user = await prisma.query.user({ where: { email: data.email } })
        if (!user) {
            throw new Error(`User (${data.email}) not found.`)
        }
        const isPasswordMatch = await bcrypt.compare(data.password, user.password)
        if (!isPasswordMatch) {
            throw new Error('Password doesn\'t match')
        }
        return {
            user,
            token: generateToken(user.id)
        }
    },
    deleteUser: (parent, args, { prisma, request }, info) => prisma.mutation
        .deleteUser({ where: { id: getUserId(request) } }, info),
    updateUser: async (parent, { data }, { prisma, request }, info) => {
        if (typeof data.password === 'string') {
            data.password = await hashPassword(data.password)
        }
        return prisma.mutation.updateUser({ where: { id: getUserId(request) }, data }, info)
    },
    createPost: (parent, { data }, { prisma, request }, info) => prisma.mutation
        .createPost({
            data: {
                ...data,
                author: { connect: { id: getUserId(request) } }
            }}, info),
    deletePost: async (parent, args, { prisma, request }, info) => {
        const postExists = await prisma.exists.Post({ id: args.id, author: { id: getUserId(request) } })
        if (!postExists) {
            throw new Error('Unable to delete post')
        }
        return prisma.mutation.deletePost({ where: { id: args.id } }, info)
    },
    updatePost: async (parent, args, { prisma, request }, info) => {
        const postExists = await prisma.exists.Post({ id: args.id, author: { id: getUserId(request) } })
        if (!postExists) {
            throw new Error('Unable to update post')
        }
        const postPublished = await prisma.exists.Post({ id: args.id, published: true })
        const postCommentsNotDisabled = await prisma.exists.Post({ id: args.id, commentsDisabled: false })
        if ((postPublished && args.data.published === false)
            || (postCommentsNotDisabled && args.data.commentsDisabled === true)) {
            await prisma.mutation.deleteManyComments({ where: { post: { id: args.id } } })
        }
        return prisma.mutation.updatePost({ where: { id: args.id }, data: args.data }, info)
    },
    createComment: async (parent, { data }, { prisma, request }, info) => {
        const userId = getUserId(request)
        const postExists = await prisma.exists.Post({ id: data.post, published: true, commentsDisabled: false })
        if (!postExists) {
            throw new Error('Unable to comment, post un-published or comments are disabled')
        }
        return prisma.mutation.createComment({
            data: {
                ...data,
                author: { connect: { id: userId } },
                post: { connect: { id: data.post } }
            }}, info)
    },
    deleteComment: async (parent, args, { prisma, request }, info) => {
        const commentExists = await prisma.exists.Comment({ id: args.id, author: { id: getUserId(request) } })
        if (!commentExists) {
            throw new Error('Unable to delete comment')
        }
        return prisma.mutation.deleteComment({ where: { id: args.id } }, info)
    },
    updateComment: async (parent, args, { prisma, request }, info) => {
        const commentExists = await prisma.exists.Comment({ id: args.id, author: { id: getUserId(request) } })
        if (!commentExists) {
            throw new Error('Unable to update comment')
        }
        return prisma.mutation.updateComment({ where: { id: args.id }, data: args.data }, info)
    }
}

export default Mutation
