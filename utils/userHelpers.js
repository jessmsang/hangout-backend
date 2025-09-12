const publicUserHelper = (user) => {
  const { name, _id } = user;
  return { name, _id };
};

const privateUserHelper = (user) => {
  const { name, email, _id, savedActivities, completedActivities } = user;

  return {
    name,
    email,
    _id,
    savedActivities: savedActivities || [],
    completedActivities: completedActivities || [],
  };
};

module.exports = { publicUserHelper, privateUserHelper };
