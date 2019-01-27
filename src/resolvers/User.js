import { getUserId } from '../utils';

const User = {
    email: {
        fragment: 'fragment userId on User { id }',
        resolve: (parent, args, { request }, info) => {
            const userId = getUserId(request, false)
            if (userId && userId === parent.id) {
                return parent.email
            }
            return null
        }
    },
    posts: {
        fragment: 'fragment userId on User { id }',
        resolve: (parent, args, { prisma, request }, info) => prisma.query
            .posts({
                where: {
                    published: true,
                    author: {
                        id: parent.id
                    }
                }
            }, info)
    }
}

export default User
