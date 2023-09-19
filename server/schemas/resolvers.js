const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");
const bcrypt = require('bcrypt');

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
        throw new AuthenticationError("No profile with this email found!");
      }

      const correctPw = await User.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password!");
      }

      const token = signToken(user);
      return { token, user };
    },
    addUser: async (parent, { name, email, password }) => {
      try {
        // Check if a user with the same email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          throw new AuthenticationError('User with this email already exists');
        }

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const user = await User.create({ name, email, password: hashedPassword });

        // Generate a token for the new user
        const token = signToken(user);

        return { token, user };
      } catch (error) {
        console.error(error);
        throw new AuthenticationError('Unable to create user');
      }
    },
    saveBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { savedBooks: args.input } },
          { new: true },
        );
        return updatedUser;
      }
      throw new Error("User not found");
    },
    removeBook: async (parent, args, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: args.bookId } },
          { new: true },
        );
        return updatedUser;
      }
      throw new Error("User not found");
    },
  },
};
