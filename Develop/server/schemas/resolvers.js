const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');
const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user){
                const userData = await User.findOne({ _id: context.user_id}).select('-__v -password');
                return userData
            }
            throw new AuthenticationError('you must login')
        }
    },
    
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)
            return { token, user }
        },
        login: async (parent, { email, password } ) => {
            const user = User.findOne({ email });
            if(!user){
                throw new AuthenticationError('must enter credentials')
            }
            const correctPassword = await user.isCorrectPassword(password)
            if(!correctPassword){
                throw new AuthenticationError('must enter correct password')
            }
            const token = signToken(user)
            return { token, user }
            
        },
        saveBook: async (parent, { bookData }, context) => {
            if(context.user){
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true }
                )
                return updatedUser;
            }
        },
        removeBook: async (parent, { bookId }, context) => {
            if(context.user){
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: { bookId } } },
                    { new: true }
                )
                return updatedUser;
            }
        }
    }
}
module.exports = resolvers;