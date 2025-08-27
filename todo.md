✅ Hangout Project – Backend Checklist (Stage 2)

This file tracks rubric requirements for the backend. Check items off as you complete them.
Stage 3 (frontend + auth) will be added later.

🔴 Critical Submission Requirements

- [ ] API registers new users with valid data (POST /signup)

- [ ] App starts with npm run dev after installing dependencies

- [ ] No plagiarized code

🔵 Performance Criteria (80/100 required)

Infrastructure & Linting

- [ ] package.json exists with all dependencies & scripts

- [ ] .editorconfig present

- [ ] .eslintrc extends airbnb-base

- [ ] package.json has correct devDependencies for ESLint

- [ ] Exception for \_id rule is added

- [ ] Forbidden: no eslint-disable, eslint-disable-line, eslint-disable-next-line

- [ ] .gitignore includes node_modules (and preferably .env, logs/, etc.)

- [ ] No lint errors (npx eslint . passes)

Scripts

- [ ] npm run start → server runs on localhost:3000

- [ ] npm run dev → server runs with hot reload (nodemon)

Routes & Controllers

- [ ] GET /users/me → returns current user info (email + name)

- [ ] POST /signup → registers new user

- [ ] POST /signin → returns JWT (with valid credentials)

- [ ] GET /items → returns saved data

- [ ] POST /items → creates new data item

- [ ] DELETE /items/:id → deletes data item (only if owned by user)

- [ ] Authorization middleware protects all routes except /signin and /signup

- [ ] User routes and data routes are in separate files

Error Handling

- [ ] Centralized error handler implemented

- [ ] Proper status codes: 400, 401, 403, 404, 409, 500

- [ ] Custom error messages, not raw DB/Node errors

- [ ] Async handlers always end with .catch(next) or try/catch

Authentication & Security

- [ ] Passwords stored with bcrypt hash

- [ ] Password hash never sent in responses

- [ ] JWT secret stored in .env (production), fallback in config (dev)

- [ ] Database address taken from process.env (production)

Validation

- [ ] Validate request bodies (celebrate/joi or express-validator)

- [ ] Validate params and headers where needed

- [ ] Reject invalid data with descriptive validation error

HTTPS & Deployment

- [ ] Server accessible via HTTPS (domain listed in README.md)

🟢 Best Practices

- [ ] routes/index.js connects all routes, app.js imports routes

- [ ] Use async/await consistently

- [ ] Validation schemas live in their own module

Logging setup:

- [ ] Requests → request.log

- [ ] Errors → error.log

- [ ] Log files in .gitignore

- [ ] Centralized error handling in separate module

- [ ] API lives in /api folder or api.domain.com

🟡 Recommendations

- [ ] Create custom error classes extending Error

- [ ] Use Helmet for security headers

- [ ] Store configs/constants in separate files (config.js, constants.js)

- [ ] Implement rate limiter (e.g., express-rate-limit) in a separate file
