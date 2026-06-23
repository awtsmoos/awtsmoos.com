/**
 * B"H
 * @module ForgettingRoomIndex
 * @description House of Forgetting rooms and their concrete completion gates.
 */
const room = (id, name, requires, musag, skill, line, reward) => ({ id, name, requires, musag, skill, line, reward });

export const ForgettingRooms = {
  blessings: room('blessings', 'Forgotten Blessings', { terumahGiven: 1 }, ['hakaras_hatov', 'kedushah'], 'Prayer', 'The first blessing was remembered.', 'blessingRemembered'),
  teachers: room('teachers', 'Forgotten Teachers', { leviGiven: 1 }, ['forgotten_teacher', 'mesorah'], 'Learning', 'Teachers returned to the chain.', 'teachersRemembered'),
  students: room('students', 'Forgotten Students', { poorGiven: 1 }, ['forgotten_student', 'chinuch'], 'Kindness', 'Students returned to the future.', 'studentsRemembered'),
  gifts: room('gifts', 'Forgotten Gifts', { terumahGiven: 1, leviGiven: 1, poorGiven: 1 }, ['netinah', 'tzedakah'], 'Giving', 'Gifts stopped being trapped in the house.', 'giftsRemembered'),
  joy: room('joy', 'Forgotten Joy', { secondResolved: 1 }, ['simcha', 'oneg'], 'Song', 'Joy returned to holy eating.', 'joyRemembered'),
  flavor: room('flavor', 'Flavorless Fruit', { bikkurimGiven: 1 }, ['flavorless_fruit', 'pri_tov'], 'Agriculture', 'Fruit received flavor again.', 'fruitHasFlavor')
};

export const allForgettingRooms = () => Object.values(ForgettingRooms);
export const forgettingRoomById = id => ForgettingRooms[id] || null;
