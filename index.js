const { ApolloServer, gql } = require('apollo-server');
const axios = require('axios').default;

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post]!
  }

  enum Gender {
    MALE
    FEMALE  
  }

  input PaginationInput {
    page: Int!
    count: Int!
  }

  input PostInput {
    title: String!
    body: String!
  }

  type CreatePostResponse {
    message: String!
    id: ID!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    comments: [Comment]!
  }

  type Comment {
    id: ID!
    author: User!
  }

  type Mutation {
    createPost(data: PostInput): CreatePostResponse
    addComment(postId: ID!, text: String!): Comment
  }

  type Query {
    me: String
    getProfile: User!
    users(pagination: PaginationInput!): [User!]!
    getUserById(userId: String!): User!
    posts: [Post!]!
    getPostById(postId: ID!): Post!
  }
`;

const resolvers = {
  User: {
    posts: async (parent) => {
      const postsResponse = await axios.get(`http://localhost:3000/users/${parent.id}/posts`);
      return postsResponse.data;
    }
  },
  Post: {
    comments: async (parent) => {
      const commentsResponse = await axios.get(`http://localhost:3000/posts/${parent.id}/comments`);
      return commentsResponse.data;
    }
  },
  Comment: {
    author: async (parent) => {
      const userResponse = await axios.get(`http://localhost:3000/users/${parent.userId}`);
      return userResponse.data;
    }
  },
  Mutation: {
    createPost: async (parent, args) => {
      const response = await axios.post(`http://localhost:3000/posts`, { ...args.data, userId: 1 });
      return { message: "Post created successfully", id: response.data.id };
    },
    addComment: async (parent, args) => {
      const response = await axios.post(`http://localhost:3000/comments`, { postId: args.postId, text: args.text, userId: 1 });
      return response.data;
    }
  },
  Query: {
    getUserById: async (parent, args) => {
      const response = await axios.get(`http://localhost:3000/users/${args.userId}`);
      return response.data;
    },
    users: async (parent, args) => {
      const { pagination: { count, page } } = args;
      const response = await axios.get(`http://localhost:3000/users?_limit=${count}&_page=${page}`);
      return response.data;
    },
    posts: async () => {
      const response = await axios.get('http://localhost:3000/posts');
      return response.data;
    },
    getPostById: async (parent, args) => {
      const postResponse = await axios.get(`http://localhost:3000/posts/${args.postId}`);
      const commentsResponse = await axios.get(`http://localhost:3000/posts/${args.postId}/comments`);
      return { ...postResponse.data, comments: commentsResponse.data };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen(4000).then(() => {
  console.log('Server started on http://localhost:4000');
});
