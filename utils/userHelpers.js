const publicUserHelper = (user) => {
  const { name, _id } = user;
  return { name, _id };
};

const privateUserHelper = (user) => {
  const { name, email, _id } = user;
  return { name, email, _id };
};

module.exports = { publicUserHelper, privateUserHelper };
