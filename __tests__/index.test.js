const CognitoExpress = require('cognito-express')
const authentication = require('../')

jest.mock('cognito-express')

describe('middleware', () => {
    const spy = jest.fn();

    describe('authentication', () => {
        it('should thrown an error in case of missing awsRegion parameter', () => {
            expect(() => authentication()).toThrow('missing mandatory awsRegion parameter')
        })
        it('should thrown an error in case of missing cognitoUserPoolId parameter', () => {
            expect(() => authentication('cognitoUserPoolId')).toThrow('missing mandatory cognitoUserPoolId parameter')
        })
        it('should create an instance of cognito express', () => {
            CognitoExpress.mockImplementation(spy)
            authentication('awsRegion', 'cognitoUserPoolId')
            expect(spy).toBeCalledWith({
                region: 'awsRegion',
                cognitoUserPoolId: 'cognitoUserPoolId',
                tokenUse: "access",
                tokenExpiration: 3600000
            })
        })

        it('should reject in case of missing token', async () => {
            await authentication('awsRegion', 'cognitoUserPoolId')({ headers: {} }, {}, spy)
            expect(spy).toBeCalledWith('TokenMissingError')
        })

        it('should reject in case of empty token', async () => {
            await authentication('awsRegion', 'cognitoUserPoolId')({ headers: { authorization: '' } }, {}, spy)
            expect(spy).toBeCalledWith('TokenMissingError')
        })
        it('should call validate with accessToken and return the user', async () => {
            CognitoExpress.mockImplementation(() => ({
                validate: (token) => {
                    expect(token).toEqual('token')
                    return new Promise((resolve, reject) => resolve({
                        username: 'foo'
                    }))
                }
            }))
            let req = { headers: { authorization: 'token' } }
            await authentication('awsRegion', 'cognitoUserPoolId')(req, {}, spy)
            expect(spy).toBeCalled()
            expect(req.user).toEqual({ username: 'foo' })
        })
        it('should reject in case of validation error', async () => {
            CognitoExpress.mockImplementation(() => ({
                validate: (token) => {
                    expect(token).toEqual('token')
                    return new Promise((resolve, reject) => reject(new Error('something wrong')))
                }
            }))
            await authentication('awsRegion', 'cognitoUserPoolId')({ headers: { authorization: 'token' } }, {}, spy)

            expect(spy).toBeCalledWith('CognitoValidationError')
        })
    })
})