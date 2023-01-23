const ID_LENGTH = 8;

const generateRandomString = (length) => {
    return [...Array(length)].map((_) => ((Math.random() * 36) | 0).toString(36))
      .join``;
};

const swapRows = (list, indexA, indexB) => {
    var temp = list[indexA];
    list[indexA] = list[indexB];
    list[indexB] = temp;
    return list;
};
  
const findRowIndexById = (array, id) => {
    let returnValue = -1;
    array.some((row, index) => {
      if (row.id === id) {
        returnValue = index;
        return true;
      }
      return false;
    });
    return returnValue;
};
  
const removeIdFromArray = (array, id) => {
    const index = findRowIndexById(array, id);
    if (index !== -1) {
      return array.slice(0, index).concat(array.slice(index + 1));
    }
    return array;
};

export {
    ID_LENGTH,
    generateRandomString,
    swapRows,
    findRowIndexById,
    removeIdFromArray
}