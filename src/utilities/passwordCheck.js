const PasswordValidator = require('password-validator');

const passwordSchema = new PasswordValidator();

passwordSchema
  .is().min(8)                                    // Minimum length 8
  .has().uppercase()                              // Must have at least one uppercase letter
  .has().lowercase()                              // Must have at least one lowercase letter
  .has().digits()                                 // Must have at least one number
  .has().not().spaces();                          // Should not have spaces

module.exports = passwordSchema;
