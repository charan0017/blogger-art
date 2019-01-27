import { getUserId } from '../utils';

const Query = {
    users:  (parent, args, { prisma }, info) => {
        const opArgs = { first: args.first, skip: args.skip, after: args.after, orderBy: args.orderBy }
        if (args.query) {
            opArgs.where = {
                OR: [{
                    name_contains: args.query
                }]
            }
        }
        return prisma.query.users(opArgs, info)
    },
    myPosts: (parent, args, { prisma, request }, info) => {
        const opArgs = {
            first: args.first, skip: args.skip, after: args.after, orderBy: args.orderBy,
            where: {
                author: {
                    id: getUserId(request)
                }
            }
        }
        if (args.query) {
            opArgs.where.OR = [{
                title_contains: args.query
            }, {
                body_contains: args.query
            }]
        }
        return prisma.query.posts(opArgs, info)
    },
    posts: (parent, args, { prisma }, info) => {
        const opArgs = {
            first: args.first, skip: args.skip, after: args.after, orderBy: args.orderBy,
            where: {
                published: true
            }
        }
        if (args.query) {
            opArgs.where.OR = [{
                title_contains: args.query
            }, {
                body_contains: args.query
            }]
        }
        return prisma.query.posts(opArgs, info)
    },
    comments: (parent, args, { prisma }, info) => prisma.query
        .comments({ first: args.first, skip: args.skip, after: args.after, orderBy: args.orderBy }, info),
    me: (parent, args, { prisma, request }, info) => prisma.query
        .user({ where: { id: getUserId(request) } }, info),
    post: async (parent, args, { prisma, request }, info) => {
        const posts = await prisma.query.posts({
            where: {
                id: args.id,
                OR: [{
                    published: true
                }, {
                    author: {
                        id: getUserId(request, false)
                    }
                }]
            }
        }, info)
        if (!posts.length) {
            throw new Error('NOT_FOUND')
        }
        return posts[0]
    },
}

export default Query
