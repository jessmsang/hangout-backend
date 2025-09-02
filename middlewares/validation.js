const { Joi, celebrate } = require("celebrate");

const costLevels = ["$", "$$", "$$$"];

const validateCreateActivity = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(50).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 50',
      "string.empty": 'The "name" field must be filled in',
      "any.required": 'The "name" field is required',
    }),

    description: Joi.string().required().max(500).messages({
      "string.empty": 'The "description" field must be filled in',
      "string.max": 'The "description" field must be less than 500 characters',
    }),

    seasons: Joi.array()
      .items(Joi.string().valid("summer", "fall", "spring", "winter"))
      .min(1)
      .required()
      .messages({
        "array.min": "Please select at least one season",
        "any.only": "Invalid season value",
      }),

    location: Joi.array()
      .items(Joi.string().valid("indoor", "outdoor"))
      .min(1)
      .required()
      .messages({
        "array.min": "Please select at least one location",
        "any.only": "Invalid location value",
      }),

    category: Joi.array()
      .items(
        Joi.string().valid(
          "active",
          "adventure",
          "low-key",
          "creative",
          "dining",
          "festive",
          "romantic"
        )
      )
      .min(1)
      .required()
      .messages({
        "array.min": "Please select at least one category",
        "any.only": "Invalid category value",
      }),

    groupSize: Joi.object({
      min: Joi.number().integer().min(1).max(12).required(),
      max: Joi.number().integer().min(Joi.ref("min")).max(12).required(),
    })
      .required()
      .messages({
        "number.min": "Group size minimum must be at least 1",
        "number.max": "Group size maximum cannot be more than 12",
      }),

    cost: Joi.object({
      min: Joi.string()
        .valid(...costLevels)
        .required(),
      max: Joi.string()
        .valid(...costLevels)
        .required()
        .custom((value, helpers) => {
          const { min } = helpers.state.ancestors[0];
          if (costLevels.indexOf(value) < costLevels.indexOf(min)) {
            return helpers.message("Max cost cannot be less than min cost");
          }
          return value;
        }),
    }).required(),

    isSaved: Joi.boolean().default(false),
    isCompleted: Joi.boolean().default(false),
  }),
});

const validateCreateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.empty": 'The "name" field must be filled in',
    }),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

const validateEditUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30).messages({
      "string.min": 'The minimum length of the "name" field is 2',
      "string.max": 'The maximum length of the "name" field is 30',
      "string.empty": 'The "name" field must be filled in',
    }),
    email: Joi.string().email().required().messages({
      "string.empty": "The email field must be filled in",
      "string.email": "The email field must be a valid email address",
    }),
  }),
});

const validateUserLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

const validateUserIDFormat = celebrate({
  params: Joi.object().keys({
    id: Joi.string().required().length(24).hex(),
  }),
});

const validateActivityIDFormat = celebrate({
  params: Joi.object().keys({
    activityId: Joi.string().required().length(24).hex(),
  }),
});

const validatePasswordUpdate = celebrate({
  body: Joi.object().keys({
    oldPassword: Joi.string().required().messages({
      "string.empty": 'The "oldPassword" field must be filled in',
      "any.required": 'The "oldPassword" field is required',
    }),
    newPassword: Joi.string().required().min(6).messages({
      "string.empty": 'The "newPassword" field must be filled in',
      "string.min": 'The "newPassword" must be at least 6 characters long',
      "any.required": 'The "newPassword" field is required',
    }),
  }),
});

module.exports = {
  validateCreateActivity,
  validateCreateUser,
  validateEditUser,
  validateUserLogin,
  validateUserIDFormat,
  validateActivityIDFormat,
  validatePasswordUpdate,
};
