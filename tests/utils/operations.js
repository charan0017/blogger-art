import { gql } from 'apollo-boost';

const createUser = gql`
    mutation($data: CreateUserInput!) {
        createUser(data: $data) {
            token
            user {
                id
                name
                email
                age
            }
        }
    }
`

const getUsers = gql`
    query {
        users {
            id
            name
            email
        }
    }
`

const login = gql`
    mutation($data: LoginUserInput!) {
        login(data: $data) {
            token
        }
    }
`

const getUserProfile = gql`
    query {
        me {
            id
            name
            email
        }
    }
`

const getPosts = gql`
    query {
        posts {
            id
            title
            body
            published
            commentsDisabled
        }
    }
`

const myPosts = gql`
    query {
        myPosts {
            id
            title
            published
            commentsDisabled
        }
    }
`

const getPostById = gql`
    query($id: ID!) {
        post(id: $id) {
            id
            title
            body
            published
            commentsDisabled
        }
    }
`

const updatePost = gql`
    mutation($id: ID!, $data: UpdatePostInput!) {
        updatePost(
            id: $id,
            data: $data
        ) {
            id
            title
            body
            published
        }
    }
`

const createPost = gql`
    mutation($data: CreatePostInput!) {
        createPost(
            data: $data
        ) {
            id
            title
            body
            published
            author {
                id
            }
        }
    }
`

const deletePost = gql`
    mutation($id: ID!) {
        deletePost(id: $id) {
            id
        }
    }
`

const subscribeToPosts = gql`
    subscription {
        post {
            mutation
            node {
                id
                title
                body
                published
            }
        }
    }
`

const getComments = gql`
    query {
        comments {
            id
            text
        }
    }
`

const createComment = gql`
    mutation($data: CreateCommentInput!) {
        createComment(data: $data) {
            id
            text
            author {
                id
            }
            post {
                id
            }
        }
    }
`

const updateComment = gql`
    mutation($id: ID!, $data: UpdateCommentInput!) {
        updateComment(id: $id, data: $data) {
            id
            text
        }
    }
`

const deleteComment = gql`
    mutation($id: ID!) {
        deleteComment(id: $id) {
            id
        }
    }
`

const subscribeToComments = gql`
    subscription($postId: ID!) {
        comment(postId: $postId) {
            mutation
            node {
                id
                text
            }
        }
    }
`

export {
    createUser, getUsers, login, getUserProfile,
    getPosts, myPosts, getPostById, updatePost, createPost, deletePost, subscribeToPosts,
    getComments, createComment, updateComment, deleteComment, subscribeToComments
}
