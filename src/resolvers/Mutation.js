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
    }
}

export default Mutation
