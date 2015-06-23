export function isValidToken(token) {
  var claims;

  if (!token) {
    return false;
  }

  claims = token.split('.')[1];

  if (claims === undefined) {
    return false;
  }

  try {
    claims = JSON.parse(
      new Buffer(claims + '==', 'base64').toString('ascii')
    );
  } catch (e) {
    return false;
  }

  if (claims.exp === undefined || Math.floor(Date.now() / 1000) + 10 > claims.exp )  {
    return false;
  }

  return true;
};

