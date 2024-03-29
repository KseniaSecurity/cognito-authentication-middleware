const  CognitoExpress = require('cognito-express')

function readBearerToken(req) {
    let token = (req.headers['x-access-token'] || req.headers['authorization'] || '').toString();
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }
    return token;
}

module.exports = function (awsRegion, cognitoUserPoolId) {
    if (!awsRegion)
        throw Error('missing mandatory awsRegion parameter')
    if (!cognitoUserPoolId)
        throw Error('missing mandatory cognitoUserPoolId parameter')

    const cognitoExpress = new CognitoExpress({
        region: awsRegion,
        cognitoUserPoolId: cognitoUserPoolId,
        tokenUse: "access", //Possible Values: access | id
        tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
    })
    return async function (req, res, next) {
        //I'm passing in the access token in header under key accessToken
        let accessTokenFromClient = readBearerToken(req)
        let user
        //Fail if token not present in header.
        if (!accessTokenFromClient || accessTokenFromClient === '') {
            return next('TokenMissingError')
        } else {
            try {
                req.user = await cognitoExpress.validate(accessTokenFromClient)
                next()
            } catch (err) {
                next('CognitoValidationError')
            }
        }
    }
}
