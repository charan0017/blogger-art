import { getUserId } from '../utils';

const Subscription = {
    comment: {
        subscribe: (parent, { postId }, { prisma }, info) => prisma.subscription.comment({
            where: { node: { post: { id: postId } } }
        }, info)
    },
    post: {
        subscribe: (parent, args, { prisma }, info) => prisma.subscription.post({
            where: { node: { published: true } }
        }, info)
    },
    myPost: {
        subscribe: (parent, args, { prisma, request }, info) => prisma.subscription.post({
            where: { node: { author: { id: getUserId(request) } } }
        }, info)
    }
}

export default Subscription
