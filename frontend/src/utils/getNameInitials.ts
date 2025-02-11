const getNameInitials = (name: string) => {
  const nameWords = name.split(" ");
  let initials = "";
  if (nameWords.length > 3) {
    initials += nameWords[0][0] + nameWords[nameWords.length - 1][0];
  } else if (nameWords.length === 3) {
    initials += nameWords[0][0] + nameWords[1][0] + nameWords[2][0];
  } else {
    nameWords.forEach((word) => {
      initials += word[0];
    });
  }
  return initials.toUpperCase();
};

export default getNameInitials;
