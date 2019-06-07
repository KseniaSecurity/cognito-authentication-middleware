import CognitoExpress from 'cognito-express'

//Initializing CognitoExpress constructor
let cognitoExpress

export function destroy() {
    cognitoExpress = undefined
}

export function init(awsRegion, cognitoUserPoolId) {
    if (!awsRegion)
        throw Error('missing mandatory awsRegion parameter')
    if (!cognitoUserPoolId)
        throw Error('missing mandatory cognitoUserPoolId parameter')

    cognitoExpress = new CognitoExpress({
        region: awsRegion,
        cognitoUserPoolId: cognitoUserPoolId,
        tokenUse: "access", //Possible Values: access | id
        tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
    });
}

function readBearerToken(req) {
    let token = (req.headers['x-access-token'] || req.headers['authorization'] || '').toString();
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }
    return token;
}

export async function authentication(req, res, next) {
    if (!cognitoExpress)
        return next('CognitoNotInitializedError')

    //I'm passing in the access token in header under key accessToken
    let accessTokenFromClient = readBearerToken(req)
    let user
    //Fail if token not present in header.
    if (!accessTokenFromClient || accessTokenFromClient === '') {
        return next('TokenMissingError')
    } else {
        try {
            req.user = await cognitoExpress.validate(accessTokenFromClient)
            return req
        } catch (err) {
            next('CognitoValidationError')
        }
    }
}