const publicUserHelper = (user) => {
  const { name, avatar, _id } = user;
  return { name, avatar, _id };
};

const privateUserHelper = (user) => {
  const { name, avatar, email, _id } = user;
  return { name, avatar, email, _id };
};

module.exports = { publicUserHelper, privateUserHelper };
