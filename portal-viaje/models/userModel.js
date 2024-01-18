/**
 * @fileOverview Defines the user model schema for MongoDB.
 * @module userModel
 */

/**
 * Represents a user in the application.
 * @typedef {Object} User
 * @property {string} name - The name of the user.
 * @property {string} slugify - The slugified version of the user's name.
 * @property {string} email - The email address of the user.
 * @property {string} photo - The filename of the user's profile photo.
 * @property {string} role - The role of the user.
 * @property {string} password - The hashed password of the user.
 * @property {string} passwordConfirm - The confirmation password entered by the user.
 * @property {Date} passwordChangedAt - The timestamp when the user's password was last changed.
 * @property {string} passwordResetToken - The token used for password reset.
 * @property {Date} passwordResetExpire - The expiration date of the password reset token.
 * @property {boolean} active - Indicates if the user is active or not.
 */

const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/**
 * Represents the user schema.
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
    unique: true,
    maxLength: [40, "A user name must have less or equal than 40 characters"],
    minLenght: [10, "A user name must have more or equal than 10 characters"],
  },
  slugify: String,
  email: {
    type: String,
    required: [true, "A user must have a email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlenght: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // this only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpire: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

/**
 * Middleware function that generates a slugified version of the user's name before saving.
 * @function
 * @name preSaveSlugify
 * @memberof module:userModel~User
 * @param {Function} next - The next middleware function.
 */
userSchema.pre("save", function (next) {
  this.slugify = slugify(this.name, { lower: true });
  next();
});

/**
 * Middleware function that sets the passwordChangedAt field to the current timestamp before saving.
 * @function
 * @name preSavePasswordChangedAt
 * @memberof module:userModel~User
 * @param {Function} next - The next middleware function.
 */
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

/**
 * Middleware function that filters out inactive users from query results.
 * @function
 * @name preFindActiveUsers
 * @memberof module:userModel~User
 * @param {Function} next - The next middleware function.
 */
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

/**
 * Middleware function that hashes the user's password before saving.
 * @function
 * @name preSaveHashPassword
 * @memberof module:userModel~User
 * @param {Function} next - The next middleware function.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hashSync(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

/**
 * Checks if the provided password matches the user's password.
 * @function
 * @name correctPassword
 * @memberof module:userModel~User
 * @param {string} candidatePassword - The password entered by the user.
 * @param {string} userPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} A promise that resolves to true if the passwords match, otherwise false.
 */
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Checks if the user's password was changed after a given timestamp.
 * @function
 * @name changedPasswordAfter
 * @memberof module:userModel~User
 * @param {number} JWTTimestamp - The timestamp from the JWT token.
 * @returns {boolean} True if the password was changed after the given timestamp, otherwise false.
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

/**
 * Generates a password reset token and sets the passwordResetToken and passwordResetExpire fields.
 * @function
 * @name createPasswordResetToken
 * @memberof module:userModel~User
 * @returns {string} The generated password reset token.
 */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

/**
 * Represents the User model.
 * @type {mongoose.Model<User>}
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
