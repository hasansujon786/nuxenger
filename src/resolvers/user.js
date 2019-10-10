import { UserInputError, ValidationError } from 'apollo-server-express'
import { Types } from 'mongoose'
// Moudles
import { User } from '../models'
import { attemptToSignIn, attemptToSignOut } from '../auth'
import { signUpValidator, signInValidator } from '../validators'

export default {
  Query: {
    async me(parent, args, { req }, info) {
      // TODO : projection, sanitization

      return await User.findById(req.session.userId)
    },
    async users(parent, args, { req }, info) {
      // TODO : projection, pagination, sanitization

      return await User.find({})
    },
    async user(parent, { id }, ctx, info) {
      // TODO : projection, sanitization

      if (!Types.ObjectId.isValid(id)) {
        throw new UserInputError(`${id} this id is not valid.`)
      }

      return await User.findById(id)
    },
    hello(parent, args, ctx, info) {
      return 'hello world'
    }
  },

  Mutation: {
    async signUp(parent, args, { req }, info) {
      // Validate user inputs
      const { error, value } = await signUpValidator.validate(args, { abortEarly: false })
      if (error) {
        const err = new ValidationError('Signup validation failed.')
        err.joi = error
        throw err
      }

      // Create & save user to database
      return await User.create(args)
    },
    async signIn(parent, args, { req }, info) {
      // Validate user inputs
      const { error, value } = await signInValidator.validate(args, { abortEarly: false })
      if (error) {
        const err = new ValidationError('SignIn validation failed.')
        err.joi = error
        throw err
      }

      // Find user from geiven inputs
      const user = await attemptToSignIn(args.email, args.password)

      // Settting userId on session Obj
      req.session.userId = user.id

      return user
    },
    async signOut(parent, args, { req, res }, info) {
      // Return true/false
      return await attemptToSignOut(req, res)
    }
  }
}
