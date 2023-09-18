const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

module.exports = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw new Error("User not authenticated");
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('No profile with this email found!');
        }
  
        const correctPw = await User.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Incorrect password!');
        }
  
        const token = signToken(user);
        return { token, user };
      },
      addUser: async (parent, { name, email, password }) => {
        const user = await User.create({ name, email, password });
        const token = signToken(user);
  
        return { token, user };
      },
    },
  };
